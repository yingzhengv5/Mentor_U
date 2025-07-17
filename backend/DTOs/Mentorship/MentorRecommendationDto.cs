using backend.Models.Enums;

namespace backend.DTOs.Mentorship
{
    public class MentorRecommendationDto
    {
        public UserDto Mentor { get; set; } = null!;
        public double MatchScore { get; set; }
    }
}
