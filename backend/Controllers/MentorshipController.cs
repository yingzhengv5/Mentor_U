// backend/Controllers/MentorshipController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTOs.Mentorship;
using System.Security.Claims;
using backend.DTOs;
using backend.Exceptions;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MentorshipController : ControllerBase
    {
        private readonly MentorshipService _mentorshipService;

        public MentorshipController(MentorshipService mentorshipService)
        {
            _mentorshipService = mentorshipService;
        }

        // Get all available mentors
        [HttpGet("mentors")]
        [AllowAnonymous]
        public async Task<ActionResult<List<UserDto>>> GetAllMentors()
        {
            var mentors = await _mentorshipService.GetAllMentorsAsync();
            return Ok(mentors);
        }

        // Get personalized mentor recommendations
        [HttpGet("recommendations")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<List<MentorRecommendationDto>>> GetRecommendations()
        {
            var studentId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            var recommendations = await _mentorshipService.GetMentorRecommendationsAsync(studentId);
            return Ok(recommendations);
        }

        // Request a mentorship
        [HttpPost("request")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<MentorshipResponseDto>> RequestMentorship(MentorshipRequestDto request)
        {
            var studentId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            var mentorship = await _mentorshipService.RequestMentorshipAsync(studentId, request);
            return Ok(mentorship);
        }

        // Respond to mentorship request
        [HttpPost("{mentorshipId}/respond")]
        [Authorize(Roles = "Mentor")]
        public async Task<ActionResult<MentorshipResponseDto>> RespondToRequest(
            Guid mentorshipId,
            [FromBody] bool accept)
        {
            var mentorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            var mentorship = await _mentorshipService.RespondToMentorshipRequestAsync(mentorId, mentorshipId, accept);
            return Ok(mentorship);
        }
    }
}