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

            onCreate: function () {
                this.getView().setBusy(true);
                let oModel = this.getOwnerComponent().getModel();
                let that = this;
                let crReq = this.getView().byId("input-creq").getValue();
                let equip = this.getView().byId("input-equip").getValue();
                let disco = this.getView().byId("input-disco").getValue();
                let discoOptions = this.getView().byId("input-dopt").getValue();
                let logCat = this.getView().byId("input-lcat").getValue();
                let comment = this.getView().byId("input-comm").getValue();
                debugger;
                let crData = {"EstChgReq": crReq, "EquipType": equip, "Diso": disco, "DisoOptions": discoOptions, "LogCatg": logCat, "Comments": comment};
                oModel.create("/ProcurementList", crData, {
                    success: function (oResponse) {
                        debugger;
                        that.getView().setBusy(false);
                        MessageToast.show("Procurement List " + oResponse.Plist + " is generated for CR# " + oResponse.EstChgReq);

                        var oHistory = History.getInstance();
                        var sPreviousHash = oHistory.getPreviousHash();
                            debugger;
                        that.getView().byId("input-creq").setValue("");
                        that.getView().byId("input-equip").setValue("");
                        that.getView().byId("input-disco").setValue("");
                        that.getView().byId("input-dopt").setValue("");
                        that.getView().byId("input-lcat").setValue("");
                        that.getView().byId("input-comm").setValue("");
                        if (sPreviousHash !== undefined) {
                            window.history.go(-1);
                        } else {
                            var oRouter = that.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteMainView", {}, true);
                        }

                    },
                    error: function (oError) {
                        debugger;
                        that.getView().setBusy(false);
                        let vError = JSON.parse(oError.responseText);
                        MessageBox.show(
                            vError.error.message.value, {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error while saving data",
                            }
                        );
                    }
                });
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
    
            onExit: function () {
                // this._oSmartTable = null;
                // this._oMockServer.stop();
            }
        });
    });
