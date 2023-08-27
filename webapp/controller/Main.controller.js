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
                        onClose: function(oAction) { 
                            
                            if ( oAction == "YES" ) {
                                let sPath = "/ProcurementList(Plist='" + pList + "')";
                                oModel.remove(sPath, {
                                    success: function (oResponse) {
                                        
                                        MessageToast.show("PL# " + pList + " is deleted");
                                    },
                                    error: function (oError) {
                                        let eMessage =  "Error deleting PL# " + pList;
                                        MessageBox.show(eMessage, {icon: MessageBox.Icon.ERROR, title: "Error"});
                                        
                                    }
                                })
                            } else {
                                MessageToast.show("Delete action cancelled");
                            }
                        }
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
