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
                this.enableCarousel()
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

                let option = document.createElement( 'option' )
                option.value = pokemon.name
                option.textContent = pokemon.name.replaceAll( "-", " " )

                this.view.select.append( option )
            }
        }
       
        async setPokemon(pokemon){
            
            let data = await this.data.getPokemon( pokemon )
            if( data ){

                this.view.stats.abilities.innerHTML = ""

                this.view.stats.moves.innerHTML = ""

                this.data.currentPokemonSprites = []
                this.data.currentPokemonSpriteIndex = 0

                const name = this.data.reformatPokemonName( pokemon )
                this.view.stats.name.textContent = name

                for(let sprite in data.sprites){
                    const s = data.sprites[sprite]
                    if( s && typeof s === 'string' )this.data.currentPokemonSprites.push( data.sprites[sprite] )
                }


                if(this.data.currentPokemonSprites.length){
                    this.view.carousel.images.src = this.data.currentPokemonSprites[0]
                }
                this.view.carousel.images.alt = name
                this.view.carousel.prevBtn.style.opacity = 1
                this.view.carousel.nextBtn.style.opacity = 1

                data.abilities.forEach( (ability, i ) => {
                    let a = document.createElement('li')
                    const affix = i < data.abilities.length - 1 ? ", " : "" 
                    a.textContent = ability.ability.name + affix
                    this.view.stats.abilities.append(a)
                })

                data.moves.forEach( (move, i ) => {
                    let m = document.createElement('li')
                    const affix = i < data.moves.length - 1 ? ", " : "" 
                    m.textContent = move.move.name + affix
                    this.view.stats.moves.append(m)
                })
                // this.view.abilities. = pokemon.replaceAll("-"," ")
            }else{
                console.log("whoopsies something went wrong - try to catch them all later")
            }   
        }
        
        enableButtons(){
            this.view.randomButton.addEventListener( 'click', this.randomButtonClickHandler )

            this.view.select.addEventListener( 'change', this.selectChangeHandler )
        }

        enableCarousel(){
            this.view.carousel.nextBtn.addEventListener('click', event => {
                if( this.data.currentPokemonSprites.length ){
                    if( this.data.currentPokemonSpriteIndex < this.data.currentPokemonSprites.length - 1 ){
                        this.data.currentPokemonSpriteIndex ++ 
                    }else{
                        this.data.currentPokemonSpriteIndex = 0
                    }
                    this.view.carousel.images.src =  this.data.currentPokemonSprites[this.data.currentPokemonSpriteIndex]
                }
            })

            this.view.carousel.prevBtn.addEventListener('click', event => {
                if( this.data.currentPokemonSprites.length ){
                    if( this.data.currentPokemonSpriteIndex > 0 ){
                        this.data.currentPokemonSpriteIndex -- 
                    }else{
                        this.data.currentPokemonSpriteIndex = this.data.currentPokemonSprites.length - 1
                    }
                    this.view.carousel.images.src =  this.data.currentPokemonSprites[this.data.currentPokemonSpriteIndex]
                }
            })
        }

        randomButtonClickHandler = ( event ) => {
            const name = this.data.getRandomPokemon().name
            this.setPokemon( name )
        }

        selectChangeHandler = ( event ) => {
            if( event.currentTarget.value != "")this.setPokemon( event.currentTarget.value )
        }

       
       
        
    }

    window.onload = () => {

        // data object that holds the current pokemon and functions for fetching pokemon
        const data = {
            currentPokemon: "",
            currentPokemonSprites: [],
            currentPokemonSpriteIndex: 0,
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
            async getPokemon(pokemon){
                //fetch pokemon
                const response = await this.getData("pokemon/" + pokemon)
                if(response.sucess){
                    this.currentPokemon = response.data
                    return this.currentPokemon
                }else{
                    return false
                }
            },
            formatPokemonName(pokemon){
                return pokemon.replaceAll(" ", "-")
            },
            reformatPokemonName(pokemon){
                pokemon = pokemon.replaceAll("-", " ")
                const name = this.toTitleCase( pokemon )
                return name
            },
            //https://www.w3docs.com/snippets/javascript/how-to-convert-string-to-title-case-with-javascript.html
            toTitleCase(str) {
                return str.toLowerCase().split(' ').map(function (word) {
                  return (word.charAt(0).toUpperCase() + word.slice(1));
                }).join(' ');
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
            carousel: {
                prevBtn: document.querySelector('#prev-btn'),
                nextBtn: document.querySelector('#next-btn'),
                images:  document.querySelector('.images img'),
            },
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