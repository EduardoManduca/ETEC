        async function carregarKits() {
            try {
                const response = await fetch("http://localhost:5000/kits");
                const kits = await response.json();

                const tabela = document.querySelector("#tabela-kits-materiais tbody");
                tabela.innerHTML = "";

                kits.forEach(kit => {
                    const linha = document.createElement("tr");

                    const materiais = kit.materiais.map(m => `${m.item} (${m.quantidade})`).join(", ") || "-";
                    const equipamentos = kit.equipamentos.map(e => `${e.item} (${e.quantidade})`).join(", ") || "-";

                    linha.innerHTML = `
                    <td>${kit.nomeKit}</td>
                    <td>${materiais}</td>
                    <td>${equipamentos}</td>
                    <td id="observacoes-msg">${kit.observacoes}</td>
                    <td>
                        <button class="btn-editar" onclick="editarKit('${kit._id}')">Editar</button>
                        <button class="btn-excluir" onclick="excluirKit('${kit._id}')">Excluir</button>
                    </td>
                `;
                    tabela.appendChild(linha);
                });

            } catch (err) {
                console.error("Erro ao carregar kits:", err);
            }
        }

        async function excluirKit(id) {
            if (!confirm("Tem certeza que deseja excluir este kit?")) return;
            try {
                const resp = await fetch(`http://localhost:5000/kits/${id}`, { method: "DELETE" });
                if (resp.ok) {
                    alert("Kit excluído com sucesso!");
                    carregarKits();
                } else {
                    alert("Erro ao excluir kit.");
                }
            } catch (err) {
                console.error(err);
            }
        }

        carregarKits();