using backend.Models.Enums;

namespace backend.DTOs.Mentorship
{
    public class MentorRecommendationDto
    {
        public UserDto Mentor { get; set; } = null!;

        // Match score between 0 and 1
        public double MatchScore { get; set; }

        // AI-generated explanation of why this mentor is recommended
        public string RecommendationReason { get; set; } = string.Empty;

        // Skills that match between mentor and student
        public List<string> MatchingSkills { get; set; } = new();

        // Additional skills student can learn from this mentor
        public List<string> AdditionalSkills { get; set; } = new();
    }
}
