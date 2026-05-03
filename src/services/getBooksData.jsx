export async function getBooksData() {
  try {
    const books = await window.electronAPI.readBooks();
    return books;
  } catch (error) {
    console.error("Erreur:", error);
    return [];
  }
}
