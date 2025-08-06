"use strict";

/**
 * Definición de biomas base para el generador de mazmorras.
 * Formato claro y fácilmente editable.
 */

const Biomas = {
    lista: [
        { id: 0, nombre: "Marino", color: "#466eab", habitabilidad: 0 },
        { id: 1, nombre: "Desierto cálido", color: "#fbe79f", habitabilidad: 4 },
        { id: 2, nombre: "Desierto frío", color: "#b5b887", habitabilidad: 10 },
        { id: 3, nombre: "Sabana", color: "#d2d082", habitabilidad: 22 },
        { id: 4, nombre: "Pradera", color: "#c8d68f", habitabilidad: 30 },
        { id: 5, nombre: "Bosque tropical estacional", color: "#b6d95d", habitabilidad: 50 },
        { id: 6, nombre: "Bosque templado caducifolio", color: "#29bc56", habitabilidad: 100 },
        { id: 7, nombre: "Selva tropical", color: "#7dcb35", habitabilidad: 80 },
        { id: 8, nombre: "Bosque lluvioso templado", color: "#409c43", habitabilidad: 90 },
        { id: 9, nombre: "Taiga", color: "#4b6b32", habitabilidad: 12 },
        { id: 10, nombre: "Tundra", color: "#96784b", habitabilidad: 4 },
        { id: 11, nombre: "Glaciar", color: "#d5e7eb", habitabilidad: 0 },
        { id: 12, nombre: "Pantano", color: "#0b9131", habitabilidad: 12 }
    ],

    /**
     * Devuelve un bioma por su ID.
     * @param {number} id - ID del bioma.
     * @returns {object} Bioma encontrado o null.
     */
    getPorId(id) {
        return this.lista.find(b => b.id === id) || null;
    },

    /**
     * Devuelve un bioma aleatorio.
     * @returns {object} Bioma aleatorio.
     */
    getAleatorio() {
        const index = Math.floor(Math.random() * this.lista.length);
        return this.lista[index];
    },

    /**
     * Devuelve todos los biomas disponibles.
     * @returns {array} Lista de biomas.
     */
    getTodos() {
        return this.lista;
    }
};

// Exportar para uso en Node.js o ES Modules
if (typeof module !== "undefined") {
    module.exports = Biomas;
}