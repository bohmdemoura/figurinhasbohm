import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

async function findUserAndShowDuplicates() {
    const searchTerm = document.getElementById('search-username').value.trim();
    const resultDiv = document.getElementById('connection-result');
    const listUl = document.getElementById('neighbor-duplicates-list');

    if (!searchTerm) {
        alert("Por favor, digite um username.");
        return;
    }

    try {
        const q = query(collection(db, "public_trades"), where("username", "==", searchTerm));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Nenhum usuário encontrado com esse nome.");
            resultDiv.style.display = 'none';
            return;
        }

        listUl.innerHTML = ''; // Limpa a lista anterior

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.duplicates && data.duplicates.length > 0) {
                listUl.innerHTML = data.duplicates.map(f => `<li>${f}</li>`).join('');
            } else {
                listUl.innerHTML = "<li>Este usuário não tem repetidas no momento.</li>";
            }
            
            resultDiv.style.display = 'block'; // Mostra o resultado
        });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        alert("Erro na busca. Verifique o console.");
    }
}

// Garante que o evento seja vinculado após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-search-user');
    if (btn) {
        btn.addEventListener('click', findUserAndShowDuplicates);
    }
});