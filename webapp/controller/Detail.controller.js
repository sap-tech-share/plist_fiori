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
                
                let oModel = this.getOwnerComponent().getModel();
                // let oModel = sap.ui.getCore().getModel();
                this.getView().setModel(oModel);
                this.getView().bindElement("/ProcurementList");


                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteDetailView").attachPatternMatched(this._onRouteMatched, this);


            },

            _onRouteMatched: function (oEvent) {
                let pList = oEvent.getParameter("arguments").Plist;

                
                let sPath = "/ProcurementList(Plist='" + pList + "')";
                this.getView().bindElement(sPath);

                let editInputControls = this.getView().getControlsByFieldGroupId("edit").filter(c => c.isA(["sap.m.Input", "sap.m.DatePicker", "sap.m.TextArea"]));
                let editButtonControls = this.getView().getControlsByFieldGroupId("btn-grp-edit").filter(c => c.isA("sap.m.Button"));
                let dispButtonControls = this.getView().getControlsByFieldGroupId("btn-grp-disp").filter(c => c.isA("sap.m.Button"));

                let pAction = oEvent.getParameter("arguments").Action;
                if ( pAction === "Update" ) {                    
                    editInputControls.forEach(element => { element.setEnabled(true); });
                    editButtonControls.forEach(element => { element.setVisible(true); });
                    dispButtonControls.forEach(element => { element.setVisible(false); });
                } else {
                    editInputControls.forEach(element => { element.setEnabled(false); });
                    editButtonControls.forEach(element => { element.setVisible(false); });
                    dispButtonControls.forEach(element => { element.setVisible(true); });
                }
            },

            onUpdate: function () {
                
                let oModel = this.getOwnerComponent().getModel();
                let that = this;

                let editInputControls = this.getView().getControlsByFieldGroupId("edit").filter(c => c.isA(["sap.m.Input", "sap.m.DatePicker", "sap.m.TextArea"]) );
                let currData = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath);
                let updData = { "Plist" : currData.Plist};
                let dataChanged = false;
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

                

                if (dataChanged) {
                    this.getView().setBusy(true);
                    
                    oModel.sDefaultUpdateMethod = sap.ui.model.odata.UpdateMethod.Merge;
                    oModel.update(this.getView().getBindingContext().sPath, updData, 
                    {
                        success: function (oResponse) {
                            
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
                        },

                        error: function (oError) {
                            
                            that.getView().setBusy(false);
                            let vError = JSON.parse(oError.responseText);
                            MessageBox.show(vError.error.message.value, {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error while updating data",
                            });
                        }
                    });
                } else {
                    MessageBox.show("", {
                        icon: MessageBox.Icon.INFO,
                        title: "Nothing to Update",
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
