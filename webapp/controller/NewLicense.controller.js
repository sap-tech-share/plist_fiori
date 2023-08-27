sap.ui.define(
    [
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

        return Controller.extend("project1.controller.NewLicense", {
            onInit: function () {
                
            },

            onCancel: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                
                this.getView().byId("input-plno").setValue("");
                this.getView().byId("input-dopt").setValue("");
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
                let plateNo = this.getView().byId("input-plno").getValue();
                let discoOptions = this.getView().byId("input-dopt").getValue();
                let comment = this.getView().byId("input-comm").getValue();
                
                let crData = {
                    PlateNo: plateNo,
                    DisoOptions: discoOptions,
                    Comments: comment,
                };
                oModel.create("/ProcurementList", crData, {
                    success: function (oResponse) {
                        
                        that.getView().setBusy(false);
                        MessageToast.show(
                            "Procurement List " +
                            oResponse.Plist +
                            " is generated for Plate# " +
                            oResponse.PlateNo
                        );

                        var oHistory = History.getInstance();
                        var sPreviousHash = oHistory.getPreviousHash();
                        
                        that.getView().byId("input-plno").setValue("");
                        that.getView().byId("input-dopt").setValue("");
                        that.getView().byId("input-comm").setValue("");
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
                            title: "Error while saving data",
                            
                        });
                    },
                });
            },

            checkRequiredField: function (oEvent) {
                var oInput = oEvent.getSource();
                if (!oInput.getValue()) {
                    oInput.setValueState("Error");

                    oInput.setValueStateText("This field is required");
                    this.getView().byId("btn-create").setEnabled(false);
                } else {
                    
                    let pData = this.getView().getModel().oData;
                    let PlateNos = Object.keys(pData)
                        .map((key) => {
                            if (key.substring(0, 9) === "Resources") {
                                return pData[key];
                            }
                        })
                        .filter((key) => key)
                        .map((val) => val.PlateNo);
                    if (!PlateNos.includes(oInput.getValue())) {
                        oInput.setValueState("Error");
                        oInput.setValueStateText("Invalid Plate Number");
                        this.getView().byId("btn-create").setEnabled(false);
                    } else {
                        oInput.setValueState("None");
                        this.getView().byId("btn-create").setEnabled(true);
                    }
                }

            },

            formatStringToNum: function (oVal) {

                return Number(oVal);
            },

            onExit: function () {
                
            },
        });
    }
);
