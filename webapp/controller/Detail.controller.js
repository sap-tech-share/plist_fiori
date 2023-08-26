sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History) {
        "use strict";

        return Controller.extend("project1.controller.Detail", {
            onInit: function () {

                let oModel = this.getOwnerComponent().getModel();
                this.getView().setModel(oModel);
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteDetailView").attachPatternMatched(this._onRouteMatched, this);
                

            },

            _onRouteMatched: function (oEvent) {
                let pList = oEvent.getParameter("arguments").Plist;

                // let sPath = "/ProcurementList(Plist='" + pList + "',IsActiveEntity=true)";
                let sPath = "/ProcurementList(Plist='" + pList + "')";
                this.getView().bindElement(sPath);
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
    
            onExit: function () {
                // this._oSmartTable = null;
                // this._oMockServer.stop();
            }
        });
    });
