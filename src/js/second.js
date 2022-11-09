const getData = () => import('./recipes.js')
String.prototype.removeDiacritics = function () { return this.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") }

getData().then(res => {
  // Recettes
  const data = res.default
  const recipes = data.recipes

  // DOM
  const dropDownButton = document.querySelectorAll('.rafter')
  const searchBar = document.getElementById('searchBar')
  const searchIngredientInput = document.getElementById('searchIngredient')
  const searchApplianceInput = document.getElementById('searchAppliance')
  const searchUstensilsInput = document.getElementById('searchUstensils')
  const searchBtn = document.querySelector('.search-btn')
  const recipesContainer = document.getElementById('recipes')
  const ingredientsList = document.getElementById('ingredientsList')
  const appliancesList = document.getElementById('appliancesList')
  const ustensilsList = document.getElementById('ustensilsList')
  const resultContainer = document.getElementById('results-container')

  // Tableau des composants
  const ingredientsSet = new Set()
  const appliancesSet = new Set(recipes.map(r => r.appliance))
  const ustensilsSet = new Set(recipes.map(r => r.ustensils).reduce((p, c) => [...c, ...p]))
  const recipesIngredients = recipes.map(r => r.ingredients)
  recipesIngredients.forEach(arr => {
    arr.map(i => ingredientsSet.add(i.ingredient))
  })

  // Tableaux
  let stockTag = []
  let stockRecipeFromSearch = []
  let filteredData = recipes
  
  // Lancer la fonction après x secondes
  const setTimeOutFunction = () => { setTimeout(function (){
    filterArray(searchBar) 
  }, 300)}

  // Etend le dropdown pour afficher les li
  dropDownButton.forEach(b => {
    b.addEventListener('click', (e) => {
      dropDowns.forEach(d => {
        if (d.classList.contains('expanded') && d !== e.target.parentElement) {
          d.classList.remove('expanded')
        }
      })
      e.target.parentElement.classList.toggle('expanded')
    })
  })

  // Injecter les recettes dans le DOM
  const injectNewRecipes = (container, recipe) => {

    // Vider le conteneur
    container.innerHTML = ''

    // Pour chaque recette
    recipe.forEach(r => {

      // Injecter le code HTML
      container.innerHTML +=
        `
  <article class="card" data-recipeId="${r.id}"style="width: 100%;">
        <figure class="card-figure">
          <img src="../public/assets/images/no_image.png" class="card-img-top" alt="${r.name}">
        </figure>
        <div class="card-body">
          <h3 class="card-title">${r.name}</h3>
          <div class="card-time">
            <span class="card-clock"></span>
            <span class="card-minutes">${r.time} min</span>
          </div>
          <ul class="card-ingredients">
            ${r.ingredients.map(i => `<li class="card-ingredient"><b class="bold">${i.ingredient}:</b> ${i.quantity ? i.quantity : ''} ${i.unit ? i.unit : ''}</li>`).join('')}
          </ul>
          <p class="card-text text-truncate">${r.description}</p>
        </div>
      </article>
    `
    })
  }

  // Filtre les recettes en fonction des tags en place
  const tagFilter = () => {

    // Vider le conteneur
    recipesContainer.innerHTML = ''

    // Pour chaque tag
    stockTag.forEach(tag => {

      // Filtrer le tableau
      filteredData = filteredData.filter(r => { 

        // Trouver le tag égal à l'ingredient
        const ingredientsMatches = r.ingredients.some(i => tag === i.ingredient)

        // Trouver le tag égal à l'appareil
        const applianceMatches = r.appliance === tag

        // Trouver le tag égal à l'ustensil
        const ustensilsMatches = r.ustensils.some(u => tag === u)

        // Retourner les recettes
        return ingredientsMatches || applianceMatches || ustensilsMatches
      })
    })

    // Actualiser le DOM
    setDropDowns(filteredData)
    injectNewRecipes(recipesContainer, filteredData)
  }

  // Injecter les ingrédients, appareils, ustentils dans le DOM
  const setIngredientsAppliancesUstensils = () => {

    // Pour chaque ingredient
    ingredientsSet.forEach(i => {

      // Si le tableau n'include pas l'ingrédient
      if (!stockTag.includes(i)) {

        // Injecte la li correspondante dans la ul
        ingredientsList.innerHTML += `<li class="menuListItems" data-ingredient="${i}">${i}</li>`
      }
    })

    // Pour chaque appareil
    appliancesSet.forEach(a => {
      // Si le tableau n'include pas l'appareil
      if (!stockTag.includes(a)) {
        // Injecte la li correspondante dans la ul
        appliancesList.innerHTML += `<li class="menuListItems" data-appliance="${a}">${a}</li>`
      }
    })

    // Pour chaque ingredient
    ustensilsSet.forEach(u => {
      // Si le tableau n'include pas l'ustensil
      if (!stockTag.includes(u)) {
        // Injecte la li correspondante dans la ul
        ustensilsList.innerHTML += `<li class="menuListItems" data-ustensil="${u}">${u}</li>`
      }
    })
  }

  // Initialise le DOM
  setIngredientsAppliancesUstensils()
  injectNewRecipes(recipesContainer, recipes)

  const setDropDowns = (recipe) => {
    
    // Si la longueur du tableau est différente de 0
    if (recipe.length !== 0) {
      // Reinitialise le DOM
      ingredientsList.innerHTML = ''
      appliancesList.innerHTML = ''
      ustensilsList.innerHTML = ''
    
      
      const newRecipesIngredients = recipe.map(r => r.ingredients).filter(i => !stockTag.includes(i.ingredient))
      const newAppliancesSet = recipe.map(r => r.appliance)
      const newUstensilsSet = recipe.map(r => r.ustensils).reduce((p, c) => [...c, ...p])

      // Réinitilise les Set()
      ingredientsSet.clear()
      appliancesSet.clear()
      ustensilsSet.clear()
      
      // Entrer les composants dans leurs tableaux respectifs
      newRecipesIngredients.forEach(arr => {
        arr.forEach(i => ingredientsSet.add(i.ingredient))
      })
      newAppliancesSet.forEach(a => {
        appliancesSet.add(a)
      })
      newUstensilsSet.forEach(u => {
        ustensilsSet.add(u)
      })

      setIngredientsAppliancesUstensils()

      // Sinon
    } else {
      // Reinitialise le DOM
      ingredientsList.innerHTML = ''
      appliancesList.innerHTML = ''
      ustensilsList.innerHTML = ''

      // Réinitilise les Set()
      ingredientsSet.clear()
      appliancesSet.clear()
      ustensilsSet.clear()

      // Affiche un message d'erreur
      recipesContainer.innerHTML = `
      <span>Aucune recette ne correspond à vos critères…</span>
      `
    }
    
  }

  const getResultsFromSearch = () => {
    // Vide le conteneur
    recipesContainer.innerHTML = ''
    const input = searchBar
    const searchStr = input.value.removeDiacritics()
    const regex = new RegExp(`(.*?)${searchStr}(.*\s?)`)
    let ids = []

    // Pour chaque recette dans le tableau
    for(const recipe of filteredData) {

      // Si
      if (
      // Le nom ne match pas le regex et
      !recipe.name.removeDiacritics().match(regex) && 

      // L' ingrédient ne match pas le regex et
      !recipe.ingredients.some(i => i.ingredient.removeDiacritics().match(regex)) &&

      // L' ustensil ne match pas le regex et
      !recipe.ustensils.some(u => u.removeDiacritics().match(regex)) && 

      // L'appareil ne match pas le regex et
      !recipe.appliance.removeDiacritics().match(regex) &&

      // La description ne match pas le regex 
      !recipe.description.removeDiacritics().match(regex)

      ) {
        // Met l'id de cette recette dans le tableau "ids"
        ids.push(recipe.id)
      }
    }

    // Retire dans filteredData toutes les recettes dont l'id est contenu dans "ids"
    filteredData = filteredData.filter(r => !ids.includes(r.id))

    // Actualise le DOM
    injectNewRecipes(recipesContainer, filteredData)
    setDropDowns(filteredData)

    // Rappel de fonction
    addTag()
  }

  // Fonction de recherche des composants
  const searchIngredientApplianceUstensil = (input, array, result) => {
    const searchBar = input.value.removeDiacritics()
    const regex = new RegExp(`(.*?)${searchBar}(.*\s?)`)

    // Pour chaque element du tableau
    array.forEach(i => {

      // Si l'élément match le regex
      if (i.removeDiacritics().match(regex)) {

        // Met le dans le nouveau tableau
        result.push(i)
      }
    })
  }
  
  const filterArray = (input) => {
    // Réinitialise le tableau
    filteredData = recipes

    // Si la valeur du champs est égal à 0 et qu'aucun tag n'est renseigné ou 
    // la valeur du champs est inférieur ou égale à 2 et qu'aucun tag n'est renseigné
    if (input.value.trim().length === 0 && stockTag.length === 0 || input.value.trim().length <= 2 && stockTag.length === 0) {
      setDropDowns(filteredData)
      injectNewRecipes(recipesContainer, filteredData)
      addTag()

    // Si il y a au moins un tag renseigné et qu'il reste des recettes dans le tableau
    } else if (stockTag.length !== 0 && filteredData.length !== 0) {
      tagFilter()
      getResultsFromSearch()
      
    // Sinon
    } else {
      getResultsFromSearch() 
    }
  }

  searchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    setTimeOutFunction()
  })

  searchBar.addEventListener('input', (e) => {
    e.preventDefault()
    setTimeOutFunction()
  })

  searchIngredientInput.addEventListener('input', (e) => {
    e.preventDefault()
    stockRecipeFromSearch = []
    searchIngredientApplianceUstensil(searchIngredientInput, ingredientsSet, stockRecipeFromSearch)
    ingredientsList.innerHTML = ''
    const newRecipesIngredients = stockRecipeFromSearch
    newRecipesIngredients.forEach(i => {
      if (!stockTag.includes(i)) {
        ingredientsList.innerHTML += `<li class="menuListItems" data-ingredient="${i}">${i}</li>`
      }
    })
    addTag()
  })

  searchApplianceInput.addEventListener('input', (e) => {
    e.preventDefault()
    stockRecipeFromSearch = []
    searchIngredientApplianceUstensil(searchApplianceInput, appliancesSet, stockRecipeFromSearch)
    appliancesList.innerHTML = ''
    const newRecipesAppliances = stockRecipeFromSearch
    newRecipesAppliances.forEach(a => {
      if (!stockTag.includes(a)) {
        appliancesList.innerHTML += `<li class="menuListItems" data-appliance="${a}">${a}</li>`
      }
    })
    addTag()
  })

  searchUstensilsInput.addEventListener('input', (e) => {
    e.preventDefault()
    stockRecipeFromSearch = []
    searchIngredientApplianceUstensil(searchUstensilsInput, ustensilsSet, stockRecipeFromSearch)
    appliancesList.innerHTML = ''
    const newRecipesUstensils = stockRecipeFromSearch
     newRecipesUstensils.forEach(u => {
      if (!stockTag.includes(u)) {
        ustensilsList.innerHTML += `<li class="menuListItems" data-ustensil="${u}">${u}</li>`
      }
    })
    addTag()
  })

  const addTag = () => {
    let listItems = document.querySelectorAll('.menuListItems')
    listItems.forEach(i => {
      i.addEventListener('click', (e) => {
        let classe = ''
        if (e.target.dataset.ingredient) classe = 'ingredient'
        if (e.target.dataset.appliance) classe = 'appliance'
        if (e.target.dataset.ustensil) classe = 'ustensil'

        if (!stockTag.includes(e.target.outerText)) {
          stockTag.push(e.target.outerText)
          resultContainer.innerHTML += `
        <div class="results results--${classe}">
          <span class="cross"></span>
          <span class="result">${e.target.outerText}</span>
        </div>    
        `
        }
        filterArray(searchBar)
        deleteTag()
      })
    })
  }
  addTag()
  
  const deleteTag = () => {
    
    document.querySelectorAll('.cross').forEach(c => {
      c.addEventListener('click', (e) => {
        stockTag = stockTag.filter(i => i !== e.target.parentElement.outerText)
        e.target.parentElement.remove()
        filterArray(searchBar)
      })
    })
  }
  deleteTag()  
 })