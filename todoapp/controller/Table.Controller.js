sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast"
], function (Controller, Filter, Sorter, MessageToast) {
    "use strict";

    return Controller.extend("todo.app.controller.Table", {
        onInit: function () {
            var oBus = sap.ui.getCore().getEventBus();
            oBus.subscribe("TodoApp", "FilterChanged", this._handleFilter, this);
            oBus.subscribe("TodoApp", "SortDate", this._handleSort, this);
        },

        _handleSort: function (sChannel, sEvent, oData) {
            var oTable = this.byId("todoTable");
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.sort(new Sorter("datum", oData.descending));
                MessageToast.show(oData.descending ? "Neueste zuerst" : "Älteste zuerst");
            }
        },

        _handleFilter: function (sChannel, sEvent, oData) {
            var oTable = this.byId("todoTable");
            if (!oTable) return;
            var oBinding = oTable.getBinding("items");
            this._currentFilterData = oData;

            if (oData.value === "fertig") {
                oTable.setNoDataText("Noch nichts erledigt!");
            } else {
                oTable.setNoDataText("Alles erledigt!");
            }

            var aFilters = [];
            if (oData.value) {
                aFilters.push(new Filter(oData.field, oData.op, oData.value));
            }
            oBinding.filter(aFilters);
        },

        onCheckboxSelect: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("todo");
            var oTodo = oContext.getObject();
            var oModel = this.getOwnerComponent().getModel("todo");
            var sPath = oContext.getPath();
            var sNeuerStatus = oTodo.erledigt ? "fertig" : "offen";
            
            oModel.setProperty(sPath + "/status", sNeuerStatus);

            fetch("/api/todos/" + oTodo.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.assign({}, oTodo, { 
                    erledigt: oTodo.erledigt ? 1 : 0,
                    status: sNeuerStatus
                }))
            }).then(function(res) {
                if (!res.ok) throw new Error();
                if (this._currentFilterData) this._handleFilter(null, null, this._currentFilterData);
                oModel.refresh(true);
            }.bind(this)).catch(function() {
                oModel.setProperty(sPath + "/erledigt", !oTodo.erledigt);
                oModel.setProperty(sPath + "/status", !oTodo.erledigt ? "fertig" : "offen");
            });
        },

        onEdit: function (oEvent) {
            this._getAppController().onEdit(oEvent);
        },

        onDelete: function (oEvent) {
            this._getAppController().onDelete(oEvent);
        },

        _getAppController: function () {
            return this.getOwnerComponent().getRootControl().getController();
        }
    });
}); 