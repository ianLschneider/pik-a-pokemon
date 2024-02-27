    class PikAPokemon {

        constructor(data, view, text){

            this.data = data
            this.view = view
            this.text = text

            this.boundListeners = []

            this.init()
        }
        async init(){
            let data = await this.data.getAllPokemon()
            if( data ){
                this.setFinderText()
                this.enableButtons()
                this.setAllPokemon()
            }else{
                console.log("no pokemon")
            }   
        }
        setFinderText(){
            this.view.randomButton.innerText = this.text.randomButton
            // this.view.updateText( this.text.intro, this.view.prompt )
            // this.view.updateText( this.text.select, this.view.select )
        }
        setAllPokemon(){
            for(let pokemon of this.data.allPokemon){
                // console.log("pokemon:", pokemon)

                let option = document.createElement( 'option' )
                option.value = pokemon.name
                option.textContent = pokemon.name.replaceAll( "-", " " )

                this.view.select.append( option )
            }
        }
        setPokemon(){

        }
        randomButtonClickHandler = ( event ) => {
            const name = this.data.getRandomPokemon().name

            // console.log("name:",name)

            this.view.updatePrompt( name )
        }


        selectChangeHandler( event ) {
        
            this.view.updatePrompt( event.currentTarget.value )
        }

        enableButtons(){
            this.view.randomButton.addEventListener( 'click', this.randomButtonClickHandler )

            const boundSelectChangeHandler = this.selectChangeHandler.bind( this )
            this.view.select.addEventListener( 'change', boundSelectChangeHandler )
        }

       
        
    }

    window.onload = () => {

        // data object that holds the current pokemon and functions for fetching pokemon
        const data = {
            currentPokemon: "",
            allPokemon: [],
            baseUrl: "https://pokeapi.co/api/v2/",
            async getAllPokemon(){

                const response = await this.getData("pokemon?limit=100000&offset=0")
                if(response.sucess){
                    this.allPokemon = response.data.results
                    this.allPokemon.sort( ( a, b ) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0 )
                    return true
                }else{
                    return false
                }

                
            },
            getPokemon(pokemon){
                this.currentPokemon = pokemon
                //fetch pokemon
            },
            formatPokemonName(pokemon){
                return pokemon.replaceAll(" ", "-")
            },
            getRandomPokemon(){
                return this.allPokemon [ Math.floor( Math.random() * this.allPokemon.length ) ]
            },
            getData(query){
                const url = encodeURI( this.baseUrl + query )
                let r = fetch(url).then(
                    response => response.json()
                ).then( 
                    json => {
                        console.log(json) 
                        return { sucess: true, data: json }
                    },
                    error => {
                        return { sucess: false, error: error }
                    }
                )
                return r
            }
        }

        // view object for storing dom elements
        const finderView = {
            main: document.querySelector('.main-view'),
            select: document.querySelector('#pokemon-select'),
            randomButton: document.querySelector('.random-pokemon-button'),
            textPrompt:  document.querySelector('.prompt'),
            stats: {
                name: document.querySelector('.name'),
                abilities: document.querySelector('.abilities'),
                moves: document.querySelector('.moves'),
            },
            updatePrompt: ( text ) => {
                console.log("updatePrompt:",text,  finderView.textPrompt)
                // finderView.textPrompt.textContent = text
            }
        }

        const finderText = {
            intro: "welcome",
            randomButton: "random pokémon", 
            select: 'pick a pokémon'
        }

        const poke = new PikAPokemon(data, finderView, finderText)

    }