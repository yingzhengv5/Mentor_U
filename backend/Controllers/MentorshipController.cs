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
        public async Task<ActionResult<MentorshipResponseDto?>> RespondToRequest(
            Guid mentorshipId,
            [FromBody] bool accept)
        {
            var mentorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            var mentorship = await _mentorshipService.RespondToMentorshipRequestAsync(mentorId, mentorshipId, accept);

            if (!accept)
            {
                return Ok(new { message = "Request rejected and removed successfully" });
            }

            return Ok(mentorship);
        }

        [HttpGet("current")]
        [Authorize]
        public async Task<ActionResult<List<MentorshipResponseDto>>> GetCurrentMentorships()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));
            var mentorships = await _mentorshipService.GetCurrentMentorshipsAsync(userId);
            return Ok(mentorships);
        }

        [HttpPost("{mentorshipId}/cancel")]
        [Authorize]
        public async Task<ActionResult<MentorshipResponseDto>> CancelMentorship(Guid mentorshipId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            throw new UnauthorizedException("User not authenticated"));

            try
            {
                var mentorship = await _mentorshipService.CancelMentorshipAsync(userId, mentorshipId);
                return Ok(mentorship);
            }
            catch (UnauthorizedException ex)
            {
                return Forbid(ex.Message);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Get pending requests for mentor
        [HttpGet("pending")]
        [Authorize(Roles = "Mentor")]
        public async Task<ActionResult<List<MentorshipResponseDto>>> GetPendingRequests()
        {
            var mentorId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            var requests = await _mentorshipService.GetPendingRequestsAsync(mentorId);
            return Ok(requests);
        }

        [HttpPost("{mentorshipId}/complete")]
        [Authorize]
        public async Task<ActionResult<MentorshipResponseDto>> CompleteMentorship(Guid mentorshipId)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            throw new UnauthorizedException("User not authenticated"));

            try
            {
                var mentorship = await _mentorshipService.CompleteMentorshipAsync(userId, mentorshipId);
                return Ok(mentorship);
            }
            catch (UnauthorizedException ex)
            {
                return Forbid(ex.Message);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("pending/{studentId}")]
        [Authorize]
        public async Task<IActionResult> DeleteStudentPendingRequests(Guid studentId)
        {
            try
            {
                await _mentorshipService.DeleteStudentPendingRequestsAsync(studentId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}