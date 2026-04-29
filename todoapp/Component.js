sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
  (UIComponent, JSONModel) => {
    "use strict";

    return UIComponent.extend("todo.app.Component", {
      metadata: {
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        manifest: "json",
      },

      init() {
        UIComponent.prototype.init.apply(this, arguments);
        const oTodo = new JSONModel({ 
            buttonText: [
                { key: "creating", text: "Erstellen" }, 
                { key: "editing", text: "Speichern" }, 
                { key: "cancel", text: "Abbrechen" }, 
                { key: "discard", text: "Verwerfen" }, 
            ], 
            cacheToDo: {
            aufgabe: "",
            beschreibung: "",
            datum: "",
            status: "",
            kategorie: "",
            erledigt: false,
          }, 
          zustaende: [
            { key: "offen", text: "Offen" },
            { key: "fertig", text: "Erledigt" },
          ],
          neuesToDo: {
            aufgabe: "",
            beschreibung: "",
            datum: "",
            status: "Offen",
            kategorie: "",
            erledigt: false,
          },
          resetTemplate: {
            aufgabe: "",
            beschreibung: "",
            datum: "",
            status: "Offen",
            kategorie: "",
            erledigt: false,
          },
          todoObjekte: [],
        });

        this.setModel(oTodo, "todo");
      },
    });
  },
);
