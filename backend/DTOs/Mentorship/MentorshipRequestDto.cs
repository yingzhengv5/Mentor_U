using backend.Models.Enums;

namespace backend.DTOs.Mentorship
{
    public class MentorshipRequestDto
    {
        // ID of the mentor being requested
        public Guid MentorId { get; set; }

        // Optional message from student to mentor
        public string? Message { get; set; }

        // Desired duration of mentorship
        public MentorshipDuration Duration { get; set; }
    }
}
