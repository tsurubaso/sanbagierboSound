// File: src/pages/Plugins.jsx
import React from "react";


export default function Plugins() {
return (
<div className="p-6 text-gray-200 space-y-4">
<h1 className="text-3xl font-bold mb-4">WaveSurfer Plugins</h1>
<p className="text-gray-300">
Cette page servira d’introduction générale aux plugins de WaveSurfer.
</p>
<p className="text-gray-400">
Ici nous allons expliquer à quoi servent les plugins, comment ils s’intègrent,
et décider si on présente tout sur une seule page ou si on sépare par catégories.
</p>


<div className="bg-gray-800 p-4 rounded-lg shadow">
<h2 className="text-xl font-semibold text-indigo-300 mb-2">Plan proposé</h2>
<ul className="list-disc ml-6 space-y-1 text-gray-300">
<li>Présentation rapide : à quoi sert un plugin ?</li>
<li>Liste générale des plugins disponibles</li>
<li>Découpage possible : une seule page ou une page par plugin</li>
<li>Exemples d’intégration simple</li>
</ul>
</div>
</div>
);
}