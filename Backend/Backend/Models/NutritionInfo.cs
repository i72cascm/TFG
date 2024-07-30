using Newtonsoft.Json;

namespace Backend.Models
{
    public class NutritionInfo
    {
        [JsonProperty("calories")]
        public float Calories { get; set; }

        [JsonProperty("totalNutrients")]
        public Nutrients? TotalNutrients { get; set; }
    }

    public class Nutrients
    {
        [JsonProperty("FAT")]
        public NutrientDetail? Fat { get; set; }

        [JsonProperty("PROCNT")]
        public NutrientDetail? Protein { get; set; }

        [JsonProperty("CHOCDF")]
        public NutrientDetail? Carbohydrate { get; set; }
    }

    public class NutrientDetail
    {
        [JsonProperty("quantity")]
        public float Quantity { get; set; }

        [JsonProperty("unit")]
        public string? Unit { get; set; }
    }

    public class IngredientsRequest
    {
        public List<string>? Ingredients { get; set; }
    }
}
