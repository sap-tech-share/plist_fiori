sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (UIComponent, Controller, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("project1.controller.Main", {
            onInit: function () {
                
            },
            _getSmartTable: function () {
                if (!this._oSmartTable) {
                    this._oSmartTable = this.getView().byId("LineItemSmartTable");
                }
                return this._oSmartTable;
            },
    
            OnPlistDetail: function (oEvent) {

                let selIndex = this.getView().byId("maintable").getSelectedIndices()[0];

                if (selIndex != undefined) {
                let selContext = this.getView().byId("maintable").getContextByIndex(selIndex);
                let pList = this.getView().getModel().getProperty(selContext.sPath).Plist;
                
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteDetailView", {Plist: pList, Action: "Display"});
                } else {
                    MessageBox.show("Select an item to proceed", {icon: MessageBox.Icon.WARNING, title: "Warning"});
                }
                
            },

            OnPlistUpdate: function (oEvent) {
                
                let selIndex = this.getView().byId("maintable").getSelectedIndices()[0];
                if (selIndex != undefined) {
                let selContext = this.getView().byId("maintable").getContextByIndex(selIndex);
                let pList = this.getView().getModel().getProperty(selContext.sPath).Plist;
                
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteDetailView", {Plist: pList, Action: "Update"});
                } else {
                    MessageBox.show("Select an item to proceed", {icon: MessageBox.Icon.WARNING, title: "Warning"});
                }
                
            },            
    
            OnPlistNewLicense: function (oEvent) {
                
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
               
                oRouter.navTo("RouteNewLicenseView");
                
            },

            OnPlistNewCR: function (oEvent) {
                
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
               
                oRouter.navTo("RouteNewCRView");
                
            },

            OnUpdStat: function (oEvent) {
                
                let selIndex = this.getView().byId("maintable").getSelectedIndices()[0];
                if (selIndex != undefined) {
                let selContext = this.getView().byId("maintable").getContextByIndex(selIndex);
                let pList = this.getView().getModel().getProperty(selContext.sPath).Plist;
                
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteUpdStatusView", {Plist: pList});
                } else {
                    MessageBox.show("Select an item to proceed", {icon: MessageBox.Icon.WARNING, title: "Warning"});
                }
            },

            OnPlistDelete: function (oEvent) {
                
                let selIndex = this.getView().byId("maintable").getSelectedIndices()[0];
                if (selIndex != undefined) {
                let selContext = this.getView().byId("maintable").getContextByIndex(selIndex);
                let pList = this.getView().getModel().getProperty(selContext.sPath).Plist;
                let dMessage = "Please confirm deletion of PL# " + pList; 
                let oModel = this.getOwnerComponent().getModel();
                let that = this;
                MessageBox.show(
                    dMessage, {
                        icon: MessageBox.Icon.WARNING,
                        title: "Deletion Alert",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: async function(oAction) { 
                            
                            if ( oAction == "YES" ) {

                                let attachModel = this.getOwnerComponent().getModel("attachment");
                                let attachPath = "/GetAllOriginals";
                                let objectType = "ZOBJTEST1";
                                let objectKey = pList;
                                

                                let promise = new Promise((resolve, reject ) => { attachModel.read(attachPath, {
                                    urlParameters: {BusinessObjectTypeName: "'" + objectType + "'", 
                                                    LinkedSAPObjectKey: "'" + objectKey + "'"},
                                    success: function (oData, oResponse) { 
                                        resolve(oData);
                                        
                                    
                                    }.bind(this), 
                                    error: function (oError) {reject(oError);}
                                })
                                });

                                let attachList = await promise.then((oRes)=> {debugger; return oRes;}).catch((oErr)=> {debugger;})

                                let promises = [];
                                promises = attachList.results.map(data => {
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

                                let promisePlist = new Promise ((resolve, reject) => {
                                    let sPath = "/ProcurementList(Plist='" + pList + "')";
                                    oModel.sDefaultUpdateMethod = sap.ui.model.odata.UpdateMethod.Merge;
                                    oModel.remove(sPath, {
                                        success: function (oResponse) {
                                            resolve(oResponse);
                                        },
                                        error: function (oError) {
                                            reject(oError);
                                        }
                                        });
                                });
                                promises.push(promisePlist);

                                let retStat = await Promise.all(promises).then(()=> {
                                    return 'S';
                                }).catch(()=> {
                                    return 'E';
                                });

                                if ( retStat == 'S' ) {
                                    MessageToast.show("PL# " + pList + " is deleted");
                                } else {
                                    let eMessage =  "Error deleting PL# " + pList;
                                    MessageBox.show(eMessage, {icon: MessageBox.Icon.ERROR, title: "Error"});
                                }

                            } else {
                                MessageToast.show("Delete action cancelled");
                            }
                        }.bind(this)
                    }
                );
                } else {
                    MessageBox.show("Select an item to proceed", {icon: MessageBox.Icon.WARNING, title: "Warning"});
                }
            },

            formatDate: function (oVal) {
                
                if ( oVal != null && oVal != undefined && oVal != "" ) {
                    let oValOut = oVal.toDateString();
                    return oValOut;
                }
            },

            onExit: function () {
                this._oSmartTable = null;
                this._oMockServer.stop();
            }
        });
    });
