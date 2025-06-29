using System.Text.RegularExpressions;
using backend.Models.Enums;

namespace backend.Utilities
{
    public static class EnumExtensions
    {
        public static string ToDisplayName(this JobTitle jobTitle)
        {
            // Convert camelCase or PascalCase to space-separated words
            string value = jobTitle.ToString();
            return Regex.Replace(value, "([a-z])([A-Z])", "$1 $2");
        }

        public static string ToDisplayName(this TechSkill techSkill)
        {
            // Special cases
            if (techSkill == TechSkill.CI_CD) return "CI/CD";

            // Convert camelCase or PascalCase to space-separated words
            string value = techSkill.ToString();
            return Regex.Replace(value, "([a-z])([A-Z])", "$1 $2");
        }
    }
}