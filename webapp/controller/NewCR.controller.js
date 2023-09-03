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

        return Controller.extend("project1.controller.NewCR", {
            onInit: function () {
                this.attachList = [];
                let attachModel = this.getOwnerComponent().getModel("attachment");
                // let attachPath = "/GetAllOriginals?BusinessObjectTypeName='ZOBJTEST1'&LinkedSAPObjectKey='1'";
                let attachPath = "/GetAllOriginals";
                let objectType = "ZOBJTEST1";
                // let objectKey = pList;
                
                let oData = {"results": []}; //{"results": [{"name": "sap.jpg", "media_src": "C:\\Users\\S4HANA14\\Desktop\\ADR\\Others\\sap.jpg"}]};
                this.attachModel = new sap.ui.model.json.JSONModel(oData);
                this.getView().setModel(this.attachModel, "attachJSONModel");

                // attachModel.read(attachPath, {
                //     urlParameters: {BusinessObjectTypeName: "'" + objectType + "'", 
                //                     LinkedSAPObjectKey: "'" + objectKey + "'"},
                //     success: function (oData, oResponse) {debugger; 
                    
                //         this.attachModel = new sap.ui.model.json.JSONModel(oData);
                //         this.getView().setModel(this.attachModel, "attachJSONModel");
                    
                //     }.bind(this), 
                //     error: function (oError) {debugger;}
                // });

            },

            onCancel: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                    
                this.getView().byId("input-creq").setValue("");
                this.getView().byId("input-equip").setValue("");
                this.getView().byId("input-disco").setValue("");
                this.getView().byId("input-dopt").setValue("");
                this.getView().byId("input-lcat").setValue("");
                this.getView().byId("input-comm").setValue("");
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteMainView", {}, true);
                }
                
            },

            onCreate: async function () {
                debugger;
                this.getView().setBusy(true);
                let oModel = this.getOwnerComponent().getModel();
                let that = this;
                let crReq = this.getView().byId("input-creq").getValue();
                let equip = this.getView().byId("input-equip").getValue();
                let disco = this.getView().byId("input-disco").getValue();
                let discoOptions = this.getView().byId("input-dopt").getValue();
                let logCat = this.getView().byId("input-lcat").getValue();
                let comment = this.getView().byId("input-comm").getValue();
                
                let promise = new Promise((resolve, reject)=> {
                    let crData = {"EstChgReq": crReq, "EquipType": equip, "Diso": disco, "DisoOptions": discoOptions, "LogCatg": logCat, "Comments": comment};
                    oModel.create("/ProcurementList", crData, {
                       success: function(oResponse){
                            resolve(oResponse);
                       },
                       error: function(oErr) {
                            reject(oErr);
                       } 
                    });
                });

                let crReturn = await promise.then((oRes)=>{
                    return {type: 'S', data: oRes};
                }).catch((oErr)=> {
                    return {type: 'E', data: oErr};
                });

                if (crReturn.type == 'S') {
                    that.getView().setBusy(false);
                    MessageToast.show("Procurement List " + crReturn.data.Plist + " is generated for CR# " + crReturn.data.EstChgReq);

                    let promisesAttach = this.attachModel.oData.results.map(async (fileinfo) => {
                    // let fileData = await this.readFile(this.attachModel.oData.results[0]);
                    let fileData = await this.readFile(fileinfo);
                    debugger;
                    let attachModel = this.getOwnerComponent().getModel("attachment");

                    return new Promise ((resolve, reject) => {
                        // attachModel.setHeaders({"BusinessObjectTypeName": "ZOBJTEST1", "LinkedSAPObjectKey": crReturn.data.Plist, "Slug": this.attachModel.oData.results[0].name });
                        attachModel.setHeaders({"BusinessObjectTypeName": "ZOBJTEST1", "LinkedSAPObjectKey": crReturn.data.Plist, "Slug": fileinfo.name });
                        attachModel.create("/AttachmentContentSet", {"Content": btoa(encodeURI(fileData))}, {
                            success: function (oRes){debugger; resolve(oRes);},
                            error: function(oErr){debugger; reject(oErr);}
                        })
                    });
                    });

                    let attachRes = await Promise.all(promisesAttach).then((oRes)=>{
                        return {type: 'S', data: oRes};
                    }).catch((oErr)=> {
                        return {type: 'E', data: oErr};
                    });

                    console.log(attachRes);
                    
                    // let reader = new FileReader();
                    // reader.onload = function(e){
                    //     debugger;
                    //     let data = e.target.result;
                    // }

                    // reader.onerror = function(e){
                    //     debugger;
                    // }

                    // reader.readAsBinaryString(this.attachModel.oData.results[0]);

                    var oHistory = History.getInstance();
                    var sPreviousHash = oHistory.getPreviousHash();
                        
                    that.getView().byId("input-creq").setValue("");
                    that.getView().byId("input-equip").setValue("");
                    that.getView().byId("input-disco").setValue("");
                    that.getView().byId("input-dopt").setValue("");
                    that.getView().byId("input-lcat").setValue("");
                    that.getView().byId("input-comm").setValue("");
                    this.attachModel.oData.results = [];
                    this.attachModel.refresh();
                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        var oRouter = that.getOwnerComponent().getRouter();
                        oRouter.navTo("RouteMainView", {}, true);
                    }
                } else {
                    that.getView().setBusy(false);
                    let vError = JSON.parse(crReturn.data.responseText);
                    MessageBox.show(
                        vError.error.message.value, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error while saving data",
                        }
                    );
                }

                // let crData = {"EstChgReq": crReq, "EquipType": equip, "Diso": disco, "DisoOptions": discoOptions, "LogCatg": logCat, "Comments": comment};
                // oModel.create("/ProcurementList", crData, {
                //     success: function (oResponse) {
                        
                //         that.getView().setBusy(false);
                //         MessageToast.show("Procurement List " + oResponse.Plist + " is generated for CR# " + oResponse.EstChgReq);

                //         var oHistory = History.getInstance();
                //         var sPreviousHash = oHistory.getPreviousHash();
                            
                //         that.getView().byId("input-creq").setValue("");
                //         that.getView().byId("input-equip").setValue("");
                //         that.getView().byId("input-disco").setValue("");
                //         that.getView().byId("input-dopt").setValue("");
                //         that.getView().byId("input-lcat").setValue("");
                //         that.getView().byId("input-comm").setValue("");
                //         if (sPreviousHash !== undefined) {
                //             window.history.go(-1);
                //         } else {
                //             var oRouter = that.getOwnerComponent().getRouter();
                //             oRouter.navTo("RouteMainView", {}, true);
                //         }

                //     },
                //     error: function (oError) {
                        
                //         that.getView().setBusy(false);
                //         let vError = JSON.parse(oError.responseText);
                //         MessageBox.show(
                //             vError.error.message.value, {
                //                 icon: MessageBox.Icon.ERROR,
                //                 title: "Error while saving data",
                //             }
                //         );
                //     }
                // });
            },

            handleUploadPress: async function (oEvent) {
                debugger;
                let oFileUploader = this.getView().byId("fileUploader");
                let file = oFileUploader.oFileUpload.files[0];
                if (file != undefined) {                   
                    console.log(this.attachModel.oData.results.indexOf(file));
                    if (this.attachModel.oData.results.indexOf(file) === -1 ) {
                        this.attachModel.oData.results.push(file);
                        this.attachModel.refresh();
                        oFileUploader.clear();
                    } else {
                        MessageBox.show(
                            "", {
                                icon: MessageBox.Icon.INFO,
                                title: "File Already Exists",
                            }
                        );
                    }
                }
            },

            readFile: async function readFile (file){
                
                debugger;
                return new Promise((resolve, reject)=>{
                    let reader = new FileReader();
                    reader.onerror = function(e){
                        debugger;
                    }

                    reader.readAsDataURL(file);
                    reader.onload = function(e) {
                        debugger;
                        let data = e.target.result;
                        resolve(data.replace("data:image/jpeg;base64,",""));
                    }
                });
            },

            onDeleteAttachment: function(oEvent) {
                debugger;
                var oList = oEvent.getSource(),
                    oItem = oEvent.getParameter("listItem"),
                    cPath = oItem.getBindingContextPath();
    
                // after deletion put the focus back to the list
                // oList.attachEventOnce("updateFinished", oList.focus, oList);
    
                // send a delete request to the odata service
                // this.getView().getModel("attachJSONModel").remove(cPath);
                // this.delAttachList.push(this.attachModel.getContext(cPath).getObject());
                this.attachModel.oData.results.indexOf(this.attachModel.getContext(cPath).getObject()) !== -1 && this.attachModel.oData.results.splice(this.attachModel.oData.results.indexOf(this.attachModel.getContext(cPath).getObject()), 1)

                this.attachModel.refresh();
            },

            checkRequiredField: function (oEvent) {
                
                var oInput = oEvent.getSource();
                if(!oInput.getValue()){
                    oInput.setValueState("Error");
                    
                    oInput.setValueStateText("This field is required");
                    this.getView().byId("btn-create").setEnabled(false);
                } else {
                    oInput.setValueState("None");
                    this.getView().byId("btn-create").setEnabled(true);
                }

            },

            formatStringToNum: function (oVal) {

                return Number(oVal);
            },
    
            onExit: function () {
                
            }
        });
    });
