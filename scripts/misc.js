// recipes by ingredients
_.groupBy(Entity.sortedRecipes.map(([type, {Ingredients}]) => [type, Object.keys(Ingredients).length]).sort((a, b) => b[1] - a[1]), x => x[1]);
