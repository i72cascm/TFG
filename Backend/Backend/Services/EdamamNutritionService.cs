using Backend.Models;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Threading.Tasks;
using System;
using System.Web;
using Newtonsoft.Json;
using System.Text;

namespace Backend.Services
{
    public class EdamamNutritionService : IEdamamNutritionService
    {
        private readonly HttpClient _httpClient;
        private readonly NutritionOptions _nutritionOptions;

        public EdamamNutritionService(HttpClient httpClient, IOptions<NutritionOptions> nutritionOptions)
        {
            _httpClient = httpClient;
            _nutritionOptions = nutritionOptions.Value;
        }

        public async Task<NutritionInfo> GetNutritionInfoAsync(List<string> ingredients)
        {
            var builder = new UriBuilder("https://api.edamam.com/api/nutrition-details");
            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["app_id"] = _nutritionOptions.AppId;
            queryParams["app_key"] = _nutritionOptions.AppKey;

            builder.Query = queryParams.ToString();
            var requestUrl = builder.ToString();

            // Crear el cuerpo de la solicitud como objeto anónimo solo con ingredientes
            var requestBody = new
            {
                ingr = ingredients
            };

            // Serializar el objeto anónimo a JSON
            var jsonContent = JsonConvert.SerializeObject(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Enviar solicitud POST con los ingredientes como cuerpo
            var response = await _httpClient.PostAsync(requestUrl, content);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                // Intenta deserializar la respuesta a NutritionInfo
                var nutritionInfo = JsonConvert.DeserializeObject<NutritionInfo>(responseContent);
                if (nutritionInfo != null)
                {
                    return nutritionInfo;
                }
                else
                {
                    throw new InvalidOperationException("Failed to deserialize response.");
                }
            }
            else
            {
                Console.WriteLine($"Failed to retrieve data. Status code: {response.StatusCode}. Reason: {response.ReasonPhrase}");
                throw new HttpRequestException($"Request to Edamam API failed with status code {response.StatusCode}.");
            }
        }

    }
}
