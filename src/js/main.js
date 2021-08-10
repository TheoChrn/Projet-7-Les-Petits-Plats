const getData = () => import('./recipes.js')
getData().then(res => {
  const data = res.default
  const recipes = data.recipes
  const ingredients = recipes.map(r => r.ingredients)
  const recipesContainer = document.getElementById('recipes')
  recipes.forEach(r => {
    console.log(r.ingredients)
    recipesContainer.innerHTML +=
      `
    <article class="card" style="width: 100%;">
          <img src="./" class="card-img-top" alt="${r.name}">
          <div class="card-body">
            <h5 class="card-title">${r.name}</h5>
            <span class="cardTime">${r.time} min</span>
            <ul class="cardIngredients">
              ${r.ingredients.map(i => `<li>${i.ingredient}: ${i.quantity ? i.quantity : '0'} ${i.unit ? i.unit : ''}</li>`).join('')}
            </ul>
            <p class="card-text">${r.description}</p>
          </div>
        </article>
    `
  })
})
