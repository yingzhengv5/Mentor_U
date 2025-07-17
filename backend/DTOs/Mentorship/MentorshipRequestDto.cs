using backend.Models.Enums;

namespace backend.DTOs.Mentorship
{
    public class MentorshipRequestDto
    {
        public Guid MentorID { get; set; }
        public string? Message { get; set; }
        public MentorshipDuration Duration { get; set; }
    }
}
