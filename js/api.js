
class Api {
	constructor() {}

    checkSaveDataChange(mmu, view) {
        // Endereços de memória para dados do jogador
        const PLAYER_DATA_BASE_ADDR = 0x0300500C; // Endereço base para dados do jogador

        let playerName = "";
        let gender = "";
        let trainerID = "";
        let secretID = "";
        let playtimeHours = "";
        let playtimeMinutes = "";
        let playtimeSeconds = "";
        let playtimeFrames = "";
        let options = "";
        let nationalDexEnabled = "";
    
        try {
            // Lendo os dados do jogador conforme os endereços especificados
            playerName = readString(view, PLAYER_DATA_BASE_ADDR + 0x0000, 8); // Nome do jogador (8 bytes)
        } catch (error) {
            console.error("Erro ao ler playerName:", error);
        }
    
        try {
            gender = view.getUint8(PLAYER_DATA_BASE_ADDR + 0x0008); // Gênero (1 byte)
        } catch (error) {
            console.error("Erro ao ler gender:", error);
        }
    
        try {
            trainerID = view.getUint16(PLAYER_DATA_BASE_ADDR + 0x000A, true); // Trainer ID (2 bytes, little-endian)
        } catch (error) {
            console.error("Erro ao ler trainerID:", error);
        }
    
        try {
            secretID = view.getUint16(PLAYER_DATA_BASE_ADDR + 0x000C, true); // Secret ID (2 bytes, little-endian)
        } catch (error) {
            console.error("Erro ao ler secretID:", error);
        }
    
        try {
            playtimeHours = view.getUint8(PLAYER_DATA_BASE_ADDR + 0x000E); // Horas de jogo (1 byte)
        } catch (error) {
            console.error("Erro ao ler playtimeHours:", error);
        }
    
        try {
            playtimeMinutes = view.getUint8(PLAYER_DATA_BASE_ADDR + 0x0010); // Minutos de jogo (1 byte)
        } catch (error) {
            console.error("Erro ao ler playtimeMinutes:", error);
        }
    
        try {
            playtimeSeconds = view.getUint8(PLAYER_DATA_BASE_ADDR + 0x0011); // Segundos de jogo (1 byte)
        } catch (error) {
            console.error("Erro ao ler playtimeSeconds:", error);
        }
    
        try {
            playtimeFrames = view.getUint8(PLAYER_DATA_BASE_ADDR + 0x0012); // Frames de jogo (1 byte)
        } catch (error) {
            console.error("Erro ao ler playtimeFrames:", error);
        }
    
        try {
            options = view.getUint16(PLAYER_DATA_BASE_ADDR + 0x0014, true); // Opções (2 bytes, little-endian)
        } catch (error) {
            console.error("Erro ao ler options:", error);
        }
    
        try {
            nationalDexEnabled = view.getUint8(PLAYER_DATA_BASE_ADDR + 0x001A); // Dex Nacional habilitado (1 byte)
        } catch (error) {
            console.error("Erro ao ler nationalDexEnabled:", error);
        }
    
        console.log({
            playerName: playerName,
            gender: gender === 0 ? "Male" : "Female", // Converte o valor do gênero para texto
            trainerID: trainerID,
            secretID: secretID,
            playtime: `${playtimeHours}h ${playtimeMinutes}m ${playtimeSeconds}s ${playtimeFrames}f`,
            options: options,
            nationalDexEnabled: nationalDexEnabled === 0xDA ? true : false // Verifica se o Dex Nacional está habilitado
        });

        /* const currentSaveData = this.readMemory(memory, 0x02024284, 256); // Leia o bloco de dados do treinador

        console.log(`aaa ` + currentSaveData);

        if (!this.previousSaveData) {
            this.previousSaveData = currentSaveData;
        } else if (!this.arraysEqual(this.previousSaveData, currentSaveData)) {
            this.previousSaveData = currentSaveData;
            this.sendDataToAPI();
        } */
    }

    sendDataToAPI() {
        try {
            // Coletar dados relevantes
            const playerID = this.readMemory(0x02024284, 4); // ID do jogador
            const pokemonList = this.readPokemonList(); // Lista de Pokémon
            const badges = this.readMemory(0x02025768, 1); // Lista de insígnias (1 byte)
            const gameCompleted = this.readMemory(0x0202577B, 1); // Status do jogo

            // Construir o objeto JSON
            const data = {
                player_id: this.convertToInt(playerID),
                pokemon_list: pokemonList,
                badges: badges[0], // Convertendo o valor do badge para um número
                game_completed: gameCompleted[0] === 0x4 // Verifica se o jogo foi completado
            };

            console.log(data);
        } catch (error) {
            console.log('unable to get data:' + error.message);
        }

        // Enviar dados para a API
        /* fetch('http://sua-api-endereco.com/endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        }); */
    }

    readMemory(memory, address, length) {
        // Função para ler a memória (exemplo)
        const data = [];
        for (let i = 0; i < memory.length; i++) {
            console.log(memory[i]);
            data.push(memory[i]);
        }
        return data;
    }

    readPokemonList() {
        const pokemonList = [];
        const baseAddress = 0x02024284 + 100; // Offset para a lista de Pokémon dentro do bloco do treinador

        for (let i = 0; i < 6; i++) { // Supondo um máximo de 6 Pokémon na equipe
            const pokemonData = this.readMemory(baseAddress + i * 100, 100); // Cada Pokémon ocupa 100 bytes
            pokemonList.push(this.parsePokemonData(pokemonData));
        }

        return pokemonList;
    }

    parsePokemonData(data) {
        // Função para interpretar os dados do Pokémon
        // Isto é um exemplo, os offsets reais dependem da estrutura interna dos dados do Pokémon
        return {
            species: data[0],
            level: data[1],
            hp: data[2] + (data[3] << 8),
            // Adicionar outros campos conforme necessário
        };
    }

    convertToInt(byteArray) {
        // Função para converter um array de bytes para um inteiro
        let value = 0;
        for (let i = 0; i < byteArray.length; i++) {
            value |= byteArray[i] << (i * 8);
        }
        return value;
    }

    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
}
