sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("project1.controller.Detail", {
            onInit: function () {
                let that = this;
                let oModel = this.getOwnerComponent().getModel();
                // let oModel = sap.ui.getCore().getModel();
                this.getView().setModel(oModel);
                this.getView().bindElement("/ProcurementList");
                // this.getView().byId("panel").bindElement("/ProcurementList");

                debugger;

                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteDetailView").attachPatternMatched(this._onRouteMatched, this);


            },

            _onRouteMatched: function (oEvent) {
                let pList = oEvent.getParameter("arguments").Plist;

                
                this.sPath = "/ProcurementList(Plist='" + pList + "')";
                this.getView().bindElement(this.sPath);

                let editInputControls = this.getView().getControlsByFieldGroupId("edit").filter(c => c.isA(["sap.m.Input", "sap.m.DatePicker", "sap.m.TextArea"]));
                let editButtonControls = this.getView().getControlsByFieldGroupId("btn-grp-edit").filter(c => c.isA("sap.m.Button"));
                let dispButtonControls = this.getView().getControlsByFieldGroupId("btn-grp-disp").filter(c => c.isA("sap.m.Button"));
                let uploadControls = this.getView().getControlsByFieldGroupId("upload");

                let pAction = oEvent.getParameter("arguments").Action;
                if ( pAction === "Update" ) {                    
                    editInputControls.forEach(element => { element.setEnabled(true); });
                    editButtonControls.forEach(element => { element.setVisible(true); });
                    dispButtonControls.forEach(element => { element.setVisible(false); });
                    uploadControls.forEach(element => { element.setVisible(true); });

                    this.getView().byId("attach-list").setMode("Delete");
                } else {
                    editInputControls.forEach(element => { element.setEnabled(false); });
                    editButtonControls.forEach(element => { element.setVisible(false); });
                    dispButtonControls.forEach(element => { element.setVisible(true); });
                    uploadControls.forEach(element => { element.setVisible(false); });

                    this.getView().byId("attach-list").setMode("None");
                }


                this.delAttachList = [];
                let attachModel = this.getOwnerComponent().getModel("attachment");
                // let attachPath = "/GetAllOriginals?BusinessObjectTypeName='ZOBJTEST1'&LinkedSAPObjectKey='1'";
                let attachPath = "/GetAllOriginals";
                let objectType = "ZOBJTEST1";
                let objectKey = pList;
                

                attachModel.read(attachPath, {
                    urlParameters: {BusinessObjectTypeName: "'" + objectType + "'", 
                                    LinkedSAPObjectKey: "'" + objectKey + "'"},
                    success: function (oData, oResponse) {debugger; 
                    
                        this.attachModel = new sap.ui.model.json.JSONModel(oData);
                        this.getView().setModel(this.attachModel, "attachJSONModel");
                    
                    }.bind(this), 
                    error: function (oError) {debugger;}
                });

            },

            onUpdate: async function () {
                
                // let oModel = this.getOwnerComponent().getModel();
                let oModel = this.getView().getModel();
                let that = this;
                let sPath = this.sPath;

                let editInputControls = this.getView().getControlsByFieldGroupId("edit").filter(c => c.isA(["sap.m.Input", "sap.m.DatePicker", "sap.m.TextArea"]) );
                let currData = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath);
                let updData = { "Plist" : currData.Plist};
                let dataChanged = false;
                let promises = [];
                let currDay, currMonth, currYear, scrDay, scrMonth, scrYear;
                editInputControls.forEach(element => { 
                    
                    if (element.isA("sap.m.DatePicker")) {
                        let scrDate = new Date(element.getValue());
                        let currDate = currData[element.getName()];

                        if (currDate) {currDay = currDate.getDay(); currMonth = currDate.getMonth(); currYear = currDate.getFullYear();} 
                        if (scrDate) {scrDay = scrDate.getDay(); scrMonth = scrDate.getMonth(); scrYear = scrDate.getFullYear();} 

                        if (scrDay != currDay || scrMonth != currMonth || scrYear != currYear)
                            {dataChanged = true; updData[element.getName()] = scrDate;    }
                    } else if (element.getValue() != currData[element.getName()] ){
                        dataChanged = true;
                        updData[element.getName()] = element.getValue(); 
                    }
                    
                });

                if ( this.delAttachList[0] == undefined && dataChanged == false) {
                    MessageBox.show("", {
                        icon: MessageBox.Icon.INFO,
                        title: "Nothing to Update",
                    });
                    return;
                }

                if (  this.delAttachList[0] != undefined ) {

                    let attachModel = this.getOwnerComponent().getModel("attachment");
                    
                    promises = this.delAttachList.map(data => {
                        let deleteUrl = data.__metadata.uri.substring(data.__metadata.uri.indexOf('/AttachmentContentSet'));

                        return new Promise ((resolve, reject) => {
                            attachModel.remove(deleteUrl, 
                                { 
                                    success: function(oSucc){
                                        resolve(oSucc);
                                    },
                                    error: function(oErr){
                                        reject(oErr);
                                    }
                                }   
                                );
                        });
                    });
                }


                if (dataChanged) {
                    this.getView().setBusy(true);
                    
                    let promise = new Promise ((resolve, reject) => {
                        oModel.sDefaultUpdateMethod = sap.ui.model.odata.UpdateMethod.Merge;
                        oModel.update(this.getView().getBindingContext().sPath, updData, 
                        {
                            success: function (oResponse) {
                                resolve(oResponse);
                            },

                            error: function (oError) {
                                reject(oError);
                            }
                        });
                    });
                    promises.push(promise);
                } 

                let updStat = false;
                await Promise.all(promises).then(function(oSucc){
                    updStat = true;
                    debugger;
                }).catch(function(oErr){
                    updStat = false;
                    debugger;
                })

                
                if ( updStat == true) {
                    that.getView().setBusy(false);
                    MessageToast.show("Procurement List " + currData.Plist + " is Updated" );

                    var oHistory = History.getInstance();
                    var sPreviousHash = oHistory.getPreviousHash();
                        
                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        var oRouter = that.getOwnerComponent().getRouter();
                        oRouter.navTo("RouteMainView", {}, true);
                    }
                } else {
                    that.getView().setBusy(false);
                    let vError = JSON.parse(oError.responseText);
                    MessageBox.show(vError.error.message.value, {
                        icon: MessageBox.Icon.ERROR,
                        title: "Error while updating data",
                    });
                }
            },
    
            onBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteMainView", {}, true);
                }
                
            },

            onDeleteAttachment: function(oEvent) {
                debugger;
                var oList = oEvent.getSource(),
                    oItem = oEvent.getParameter("listItem"),
                    // oSelFile = oItem.getContent()[0].getProperty("text");
                    // cPath = oItem.getBindingContext().getPath();
                    cPath = oItem.getBindingContextPath();
    
                // after deletion put the focus back to the list
                // oList.attachEventOnce("updateFinished", oList.focus, oList);
    
                // send a delete request to the odata service
                // this.getView().getModel("attachJSONModel").remove(cPath);
                this.delAttachList.push(this.attachModel.getContext(cPath).getObject());
                this.attachModel.oData.results.indexOf(this.attachModel.getContext(cPath).getObject()) !== -1 && this.attachModel.oData.results.splice(this.attachModel.oData.results.indexOf(this.attachModel.getContext(cPath).getObject()), 1)

                this.attachModel.refresh();
            },

            formatDate: function (oVal) {
                
                if ( oVal != null && oVal != undefined && oVal != "" ) {
                    let oValOut = oVal.toDateString();
                    return oValOut;
                }
            },

            formatStringToNum: function (oVal) {

                return Number(oVal);
            },

            onExit: function () {

            }
        });
    });
