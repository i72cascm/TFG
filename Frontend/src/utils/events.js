const now = new Date()

export default [
  /* {
    id: 0,
    title: 'All Day Event very long title',
    allDay: true,
    start: new Date(2015, 3, 0),
    end: new Date(2015, 3, 1),
  }, */
    // Evento 1: de 10:00 a 11:00 AM
    { id: 1, userId: 119, recipeId: 2, title: 'Evento 1', start: new Date(2024, 7, 4, 10, 0, 0), end: new Date(2024, 7, 4, 11, 0, 0) },

    // Evento 2: de 12:00 a 13:00 PM
    { id: 2, userId: 119, recipeId: 1, title: 'Evento 2', start: new Date(2024, 7, 4, 12, 0, 0), end: new Date(2024, 7, 4, 13, 0, 0) },

    // Evento 3: de 14:00 a 15:00 PM
    { id: 3, userId: 119, recipeId: 2, title: 'Evento 3', start: new Date(2024, 7, 4, 14, 0, 0), end: new Date(2024, 7, 4, 15, 0, 0) }
]