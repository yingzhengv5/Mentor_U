using backend.Models.Enums;

namespace backend.DTOs.Mentorship
{
    public class MentorshipResponseDto
    {
        public Guid Id { get; set; }
        public UserDto Mentor { get; set; } = null!;
        public UserDto Student { get; set; } = null!;
        public MentorshipStatus status { get; set; }
        public MentorshipDuration Duration { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Message { get; set; }
    }
}
