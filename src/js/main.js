const getData = () => import('./recipes.js')
String.prototype.removeDiacritics = function () { return this.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") }

getData().then(res => {
   // Recettes
  const data = res.default
  const recipes = data.recipes

    // DOM
  const dropDownButton = document.querySelectorAll('.rafter')
  const dropDowns = document.querySelectorAll('.dropdownMenu')
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
  const recipesIngredients = recipes.map(r => r.ingredients)
  const ingredientsSet = new Set()
  const appliancesSet = new Set(recipes.map(r => r.appliance))
  const ustensilsSet = new Set(recipes.map(r => r.ustensils).reduce((p, c) => [...c, ...p]))
  recipesIngredients.forEach(arr => {
    arr.map(i => ingredientsSet.add(i.ingredient))
  })
  
  // Tableaux
  let stockTag = []
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

    recipe.forEach(r => {

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
            <p class="card-text">${r.description}</p>
        </div>
      </article>
    `
    })
  }

  // Injecter les ingrédients, appareils, ustentils dans le DOM
  const setIngredientsAppliancesUstensils = () => {

    ingredientsSet.forEach(i => {

      if (!stockTag.includes(i)) {

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

  // Réinitialise les ingrédients, appareils, ustensils avant réinjection
  const setDropDowns = (recipe) => {
    if (recipe.length !== 0) {
      ingredientsList.innerHTML = ''
      appliancesList.innerHTML = ''
      ustensilsList.innerHTML = ''
    
      const newRecipesIngredients = recipe.map(r => r.ingredients).filter(i => !stockTag.includes(i.ingredient))
      const newAppliancesSet = recipe.map(r => r.appliance)
      const newUstensilsSet = recipe.map(r => r.ustensils).reduce((p, c) => [...c, ...p])
    
      ingredientsSet.clear()
      appliancesSet.clear()
      ustensilsSet.clear()
    
      newRecipesIngredients.forEach(arr => {
        arr.forEach(i => ingredientsSet.add(i.ingredient))
      })
      newAppliancesSet.forEach(a => {
        appliancesSet.add(a)
      })
      newUstensilsSet.forEach(u => {
        ustensilsSet.add(u)
      })

      // Injecte les élement dans le dom
      setIngredientsAppliancesUstensils()

    } else {
      // Renvoit une erreur
      ingredientsList.innerHTML = ''
      appliancesList.innerHTML = ''
      ustensilsList.innerHTML = ''

      ingredientsSet.clear()
      appliancesSet.clear()
      ustensilsSet.clear()

      recipesContainer.innerHTML = `
      <span>Aucune recette ne correspond à vos critères…</span>
      `
    }
  }

  // Filtre les recettes en fonction des tags en place
 const tagFilter = () => {

  // Vider le conteneur
  recipesContainer.innerHTML = ''

  stockTag.forEach(tag => {


    filteredData = filteredData.filter(r => { 

      // Trouver le tag égal à l'ingredient
      const ingredientsMatches = r.ingredients.some(i => tag === i.ingredient)

      // Trouver le tag égal à l'appareil
      const applianceMatches = r.appliance === tag

      // Trouver le tag égal à l'ustensil
      const ustensilsMatches = r.ustensils.some(u => tag === u)

      return ingredientsMatches || applianceMatches || ustensilsMatches
    })
  })

  // Actualiser le DOM
  setDropDowns(filteredData)
  injectNewRecipes(recipesContainer, filteredData)
}

  // Filtre les recettes selon ce qui est écrit dans la barre de recherche principale
  const getResultsFromSearch = () => {
    const input = searchBar
    filteredData = filteredData.filter(r => {
      console.log(r)
      const searchStr = input.value.removeDiacritics()
      const nameMatches = r.name.removeDiacritics().includes(searchStr)
      const descriptionMatches = r.description.removeDiacritics().includes(searchStr)
      const applianceMatches = r.appliance.removeDiacritics().includes(searchStr)
      const ustensilsMatches = r.ustensils.some(u => u.removeDiacritics().includes(searchStr))
      const ingredientsMatches = r.ingredients.some(i => i.ingredient.removeDiacritics().includes(searchStr))
      return nameMatches || descriptionMatches || ustensilsMatches || applianceMatches || ingredientsMatches
    })

    // Mise à jour du DOM
    injectNewRecipes(recipesContainer, filteredData)
    setDropDowns(filteredData)
  }

  const filterArray = (input) => {
    filteredData = recipes
    // Si la valeur du champs est égal à 0 et qu'aucun tag n'est renseigné ou 
    // la valeur du champs est inférieur ou égale à 2 et qu'aucun tag n'est renseigné
    if (input.value.trim().length === 0 && stockTag.length === 0 || input.value.trim().length <= 2 && stockTag.length === 0 || input.value.trim <= 2 && stockTag.length !== 0) {
      setDropDowns(filteredData)
      injectNewRecipes(recipesContainer, filteredData)

      // Si il y a au moins un tag renseigné et qu'il reste des recettes dans le tableau
    } else if (stockTag.length !== 0 && filteredData.length !== 0) {
      tagFilter()
      getResultsFromSearch()
      
    } else {
      getResultsFromSearch() 
    }
    addTag()
  }

   // Au clique sur la loupe, lance la recherche
   searchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    setTimeOutFunction()
  })

  // A l'appui d'une touche, lance la recherche
  searchBar.addEventListener('input', (e) => {
    e.preventDefault()
    setTimeOutFunction()
  })

  // Filtre la recherche selon la valeur dans la barre d'ingrédient
  searchIngredientInput.addEventListener('input', (e) => {
    e.preventDefault()
    let ingredientsResult = []
    const searchBar = searchIngredientInput.value.removeDiacritics()
    ingredientsResult = [...ingredientsSet].filter(i => {
      const matches = i.removeDiacritics().includes(searchBar)
      return matches
    })
    const newRecipesIngredients = ingredientsResult
    ingredientsList.innerHTML = newRecipesIngredients.map(i => {
      if(!stockTag.includes(i)) return `<li class="menuListItems" data-ingredient="${i}">${i}</li>`
      return ''
    }).join(' ')
    addTag()
  })

  // Filtre la recherche selon la valeur dans la barre d'appareils
  searchApplianceInput.addEventListener('input', (e) => {
    e.preventDefault()
    let apliancesResult = []
    const searchBar = searchApplianceInput.value.removeDiacritics()
    apliancesResult = [...appliancesSet].filter(i => {
      const matches = i.removeDiacritics().includes(searchBar)
      return matches
    })
    const newRecipesAppliances = apliancesResult
    appliancesList.innerHTML = newRecipesAppliances.map(a => {
      if(!stockTag.includes(a)) return `<li class="menuListItems" data-appliance="${a}">${a}</li>`
      return ''
    }).join(' ')
    addTag()
  })

  // Filtre la recherche selon la valeur dans la barre d'ustensils
  searchUstensilsInput.addEventListener('input', (e) => {
    e.preventDefault()
    let ustensilsResult = []
    const searchBar = searchUstensilsInput.value.removeDiacritics()
    ustensilsResult = [...ustensilsSet].filter(i => {
      const matches = i.removeDiacritics().includes(searchBar)
      return matches
    })
    const newRecipesUstensils = ustensilsResult
    ustensilsList.innerHTML = newRecipesUstensils.map(u => {
      if(!stockTag.includes(u)) return `<li class="menuListItems" data-ustensil="${u}">${u}</li>`
      return ''
    }).join(' ')
    addTag()
  })

  // Ajoute un tag dans le DOM et le tableau
  const addTag = () => {
    let listItems = document.querySelectorAll('.menuListItems')
    listItems.forEach(i => {
      i.addEventListener('click', (e) => {
        let classe = ''
        if (e.target.dataset.ingredient) classe = 'ingredient'
        if (e.target.dataset.appliance) classe = 'appliance'
        if (e.target.dataset.ustensil) classe = 'ustensil'

        // Si stocktag ne contient pas le tag
        if (!stockTag.includes(e.target.outerText)) {

          // L'ajouter dans le tableau des tag
          stockTag.push(e.target.outerText)

          // L'injecter dans le DOM
          resultContainer.innerHTML += `
        <div class="results results--${classe}">
          <span class="cross"></span>
          <span class="result">${e.target.outerText}</span>
        </div>    
        `
        }
        // Rappel des fonctions
        filterArray(searchBar)
        deleteTag()
      })
    })
  }
  addTag()

  // Supprime un tag
  const deleteTag = () => {
    document.querySelectorAll('.cross').forEach(c => {
      c.addEventListener('click', (e) => {

        // Retirer le tag du tableau des tag
        stockTag = stockTag.filter(i => i !== e.target.parentElement.outerText)

        // Retirer le tag du DOM
        e.target.parentElement.remove()

        // Rappel des fonctions
        filterArray(searchBar)
      })
    })
  }
  deleteTag()
})
