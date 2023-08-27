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

        return Controller.extend("project1.controller.UpdStatus", {
            onInit: function () {
                let oModel = sap.ui.getCore().getModel();
                this.getView().setModel(oModel);
                this.getView().bindElement("/ProcurementList");

                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteUpdStatusView").attachPatternMatched(this._onRouteMatched, this);

            },

            _onRouteMatched: function (oEvent) {
                let pList = oEvent.getParameter("arguments").Plist;
                
                let sPath = "/ProcurementList(Plist='" + pList + "')";
                this.getView().bindElement(sPath);

            },

            onUpdate: function () {
                
                let oModel = this.getOwnerComponent().getModel();
                let that = this;

                let currData = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath);
                let newStatus = this.getView().byId("input-status").getValue();

                if (currData.Status != newStatus) {
                    this.getView().setBusy(true);
                    
                    let actData = {"Plist": currData.Plist, "Status": newStatus};
                    oModel.callFunction("/SetStatusComplete",
                    {
                        method: "POST",
                        urlParameters: actData,
                        success: function (oResponse) {
                            
                            that.getView().setBusy(false);

                            MessageToast.show("Status for Procurement List " + currData.Plist + " is set to " + newStatus );

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
                                title: "Error while updating status",
                            });
                        }

                    });
                }

                
            },
    
            onCancel: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteMainView", {}, true);
                }
                
            },

            checkRequiredField: function (oEvent) {
                var oInput = oEvent.getSource();
                if (!oInput.getValue()) {
                    oInput.setValueState("Error");

                    oInput.setValueStateText("This field is required");
                    this.getView().byId("btn-update").setEnabled(false);
                } else {
                    if (oInput.getValue() != this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).Status)
                    { 
                        this.getView().byId("btn-update").setEnabled(true); 
                    } else {
                        this.getView().byId("btn-update").setEnabled(false); 
                    }
                    oInput.setValueState("None");
                    
                }

            },

            onExit: function () {
                
            }
        });
    });
