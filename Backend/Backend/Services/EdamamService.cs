using Backend.Modelos;
using Backend.Models;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Threading.Tasks;
using System;
using System.Web;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Backend.Services
{
    public class EdamamService
    {
        private readonly HttpClient _httpClient;
        private readonly EdamamOptions _options;

        public EdamamService(HttpClient httpClient, IOptions<EdamamOptions> options)
        {
            _httpClient = httpClient;
            _options = options.Value;
        }

        public async Task<List<RecipeInfo>> GetRecipesAsync(string query, List<string> healthLabels = null, List<string> dietLabels = null)
        {
            var builder = new UriBuilder("https://api.edamam.com/search");
            var queryParams = HttpUtility.ParseQueryString(string.Empty);

            queryParams["q"] = query;
            queryParams["app_id"] = _options.AppId;
            queryParams["app_key"] = _options.AppKey;

            if (healthLabels != null)
            {
                foreach (var label in healthLabels)
                {
                    queryParams.Add("health", label);
                }
            }

            if (dietLabels != null)
            {
                foreach (var label in dietLabels)
                {
                    queryParams.Add("diet", label);
                }
            }

            builder.Query = queryParams.ToString();
            var requestUrl = builder.ToString();

            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();

            var recipeResponse = JsonConvert.DeserializeObject<EdamamRecipe>(responseContent);

            var recipeInfos = new List<RecipeInfo>();
            foreach (var hit in recipeResponse.Hits)
            {
                var recipeInfo = new RecipeInfo
                {
                    Label = hit.Recipe.Label,
                    Image = hit.Recipe.Image,
                    Url = hit.Recipe.Url
                };
                recipeInfos.Add(recipeInfo);
            }

            return recipeInfos;
        }
    }
}
