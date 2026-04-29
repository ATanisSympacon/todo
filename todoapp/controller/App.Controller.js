sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, Filter, FilterOperator, Fragment, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("todo.app.controller.App", {
        onInit: function () {
            this._loadData();
            this._bSortDescending = false;
        },

        _loadData: function () {
            var oModel = this.getOwnerComponent().getModel("todo");
            fetch("/api/todos")
                .then(res => res.json())
                .then(data => {
                    var aData = data.map(item => ({ ...item, erledigt: item.erledigt === 1 }));
                    oModel.setProperty("/todoObjekte", aData);
                })
                .catch(err => console.error(err));
        },

        onSortDate: function () {
            this._bSortDescending = !this._bSortDescending;
            sap.ui.getCore().getEventBus().publish("TodoApp", "SortDate", { 
                descending: this._bSortDescending 
            });
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue") || "";
            sap.ui.getCore().getEventBus().publish("TodoApp", "FilterChanged", { 
                field: "aufgabe", 
                value: sQuery, 
                op: FilterOperator.Contains 
            });
        },

        onFilterStatus: function (oEvent) {
            var oItem = oEvent.getSource();
            var sKey = oItem.getKey();
            this.getView().byId("filterMenuButton").setText(sKey === "alle" ? "Zustand" : oItem.getText());
            
            var sValue = sKey === "alle" ? null : sKey;
            sap.ui.getCore().getEventBus().publish("TodoApp", "FilterChanged", { 
                field: "status", 
                value: sValue, 
                op: FilterOperator.EQ 
            });
        },

        onAddToDo: function () {
            this._openDialog("/neuesToDo");
        },

        onEdit: function (oEvent) {
            var oModel = this.getOwnerComponent().getModel("todo");
            var sPath = oEvent.getSource().getBindingContext("todo").getPath();
            oModel.setProperty("/cacheToDo", Object.assign({}, oModel.getProperty(sPath)));
            this._openDialog(sPath);
        },

        _openDialog: function (sPath) {
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    name: "todo.app.view.fragments.Dialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.pDialog.then(function (oDialog) {
                oDialog.bindElement({ path: sPath, model: "todo" });
                oDialog.open();
            });
        },

        onSave: function (oEvent) {
            var oModel = this.getView().getModel("todo");
            var oContext = oEvent.getSource().getBindingContext("todo");
            var oTodo = oModel.getProperty(oContext.getPath());

            if (!oTodo.aufgabe) return;

            var bUpdate = !!oTodo.id;
            fetch(bUpdate ? "/api/todos/" + oTodo.id : "/api/todos", {
                method: bUpdate ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.assign({}, oTodo, { erledigt: oTodo.erledigt ? 1 : 0 }))
            }).then(res => res.json()).then(data => {
                this._loadData();
                this.onCancel(oEvent, true);
            });
        },

        onCancel: function (oEvent) {
            var oDialog = oEvent.getSource();
            while (oDialog && typeof oDialog.close !== "function") oDialog = oDialog.getParent();
            if (oDialog) oDialog.close();
            this.getOwnerComponent().getModel("todo").setProperty("/neuesToDo", 
                Object.assign({}, this.getOwnerComponent().getModel("todo").getProperty("/resetTemplate")));
        },

        onDelete: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("todo").getObject();
            fetch("/api/todos/" + oItem.id, { method: "DELETE" }).then(() => this._loadData());
        }
    });
});