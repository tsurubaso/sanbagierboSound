const saveFile = async () => {
  if (!book) return;

  try {
    // 1. On sauvegarde
    const result = await window.electronAPI.writeMarkdown({
      fileName: book.name,
      content, // Le contenu actuel de l'éditeur
      branch: selectedBranch,
    });

    if (result.ok) {
      console.log("✅ Saved successfully");
      
      // 2. OPTIONNEL : On rafraîchit le store global en tâche de fond
      // pour que la liste des livres soit à jour si on revient à l'accueil
      window.electronAPI.rescanBooks().catch(console.error);

      // 3. AU LIEU de fetcher le réseau (qui peut être lent/caché), 
      // on confirme juste à l'utilisateur que c'est bon.
      // Si tu veux ABSOLUMENT re-vérifier, attends 1 seconde.
      
      alert("Saved!");
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save: " + err.message);
  }
};