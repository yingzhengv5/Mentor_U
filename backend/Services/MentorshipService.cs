// backend/Services/MentorshipService.cs
using backend.Data;
using backend.DTOs;
using backend.DTOs.Mentorship;
using backend.Exceptions;
using backend.Models;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;

namespace backend.Services
{
    public class MentorshipService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _geminiApiKey;
        private const string GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

        public MentorshipService(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
            _geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
                ?? throw new InvalidOperationException("GEMINI_API_KEY not found");
            _httpClient.DefaultRequestHeaders.Add("x-goog-api-key", _geminiApiKey);
        }

        // Get all available mentors
        public async Task<List<UserDto>> GetAllMentorsAsync()
        {
            var mentors = await _context.Users
                .Where(u => u.Role == UserRole.Mentor)
                .Include(u => u.Skills)
                    .ThenInclude(us => us.Skill)
                .Include(u => u.JobTitles)
                    .ThenInclude(ujt => ujt.JobTitle)
                .Include(u => u.MentorMentorships)
                .ToListAsync();

            return mentors.Select(m => new UserDto
            {
                Id = m.Id,
                Email = m.Email,
                FirstName = m.FirstName,
                LastName = m.LastName,
                Role = m.Role,
                Bio = m.Bio,
                ProfileImageUrl = m.ProfileImageUrl,
                Skills = m.Skills.Select(us => new SkillDto
                {
                    Id = us.Skill.Id,
                    Name = us.Skill.name
                }).ToList(),
                CurrentJobTitle = m.JobTitles.Select(ujt => new JobTitleDto
                {
                    Id = ujt.JobTitle.Id,
                    Name = ujt.JobTitle.name
                }).FirstOrDefault()
            }).ToList();
        }

        // Request a mentorship
        public async Task<MentorshipResponseDto> RequestMentorshipAsync(Guid studentId, MentorshipRequestDto request)
        {
            var mentor = await _context.Users
                .Include(u => u.MentorMentorships)
                .FirstOrDefaultAsync(u => u.Id == request.MentorId && u.Role == UserRole.Mentor)
                ?? throw new NotFoundException("Mentor not found");

            var student = await _context.Users
                .Include(u => u.StudentMentorships)
                .FirstOrDefaultAsync(u => u.Id == studentId && u.Role == UserRole.Student)
                ?? throw new NotFoundException("Student not found");

            // Check if mentor is available
            if (mentor.MentorMentorships.Any(m => m.Status == MentorshipStatus.Active))
                throw new BadRequestException("Mentor is currently in an active mentorship");

            // Check if student is available
            if (student.StudentMentorships.Any(m => m.Status == MentorshipStatus.Active))
                throw new BadRequestException("Student is currently in an active mentorship");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create new mentorship request
                var mentorship = new Mentorship
                {
                    MentorId = request.MentorId,
                    StudentId = studentId,
                    Status = MentorshipStatus.Pending,
                    Duration = request.Duration,
                    StartDate = DateTime.UtcNow,
                    EndDate = CalculateEndDate(DateTime.UtcNow, request.Duration),
                    CreatedAt = DateTime.UtcNow,
                    // Add these required properties
                    Mentor = mentor,
                    Student = student
                };

                _context.Mentorships.Add(mentorship);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetMentorshipResponseDto(mentorship.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<MentorshipResponseDto> CancelMentorshipAsync(Guid userId, Guid mentorshipId)
        {
            var mentorship = await _context.Mentorships
                .Include(m => m.Mentor)
                .Include(m => m.Student)
                .FirstOrDefaultAsync(m => m.Id == mentorshipId)
                ?? throw new NotFoundException("Mentorship not found");

            // Verify user is either mentor or student of this mentorship
            if (mentorship.MentorId != userId && mentorship.StudentId != userId)
            {
                throw new UnauthorizedException("You can only cancel mentorships you are part of");
            }

            // Only pending or active mentorships can be cancelled
            if (mentorship.Status != MentorshipStatus.Pending && mentorship.Status != MentorshipStatus.Active)
            {
                throw new BadRequestException($"Cannot cancel mentorship in {mentorship.Status} status");
            }

            mentorship.Status = MentorshipStatus.Cancelled;
            mentorship.EndDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetMentorshipResponseDto(mentorship.Id);
        }

        public async Task<List<MentorshipResponseDto>> GetPendingRequestsAsync(Guid mentorId)
        {
            var requests = await _context.Mentorships
                .Include(m => m.Mentor)
                .Include(m => m.Student)
                .Where(m => m.MentorId == mentorId && m.Status == MentorshipStatus.Pending)
                .ToListAsync();

            return requests.Select(m => new MentorshipResponseDto
            {
                Id = m.Id,
                Mentor = new UserDto
                {
                    Id = m.Mentor.Id,
                    FirstName = m.Mentor.FirstName,
                    LastName = m.Mentor.LastName,
                    Email = m.Mentor.Email,
                    Role = m.Mentor.Role,
                    Bio = m.Mentor.Bio,
                    ProfileImageUrl = m.Mentor.ProfileImageUrl
                },
                Student = new UserDto
                {
                    Id = m.Student!.Id,
                    FirstName = m.Student.FirstName,
                    LastName = m.Student.LastName,
                    Email = m.Student.Email,
                    Role = m.Student.Role,
                    Bio = m.Student.Bio,
                    ProfileImageUrl = m.Student.ProfileImageUrl
                },
                Status = m.Status,
                Duration = m.Duration,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                Message = m.Message
            }).ToList();
        }


        // Accept or reject mentorship request
        public async Task<MentorshipResponseDto?> RespondToMentorshipRequestAsync(Guid mentorId, Guid mentorshipId, bool accept)
        {
            var mentorship = await _context.Mentorships
                .Include(m => m.Mentor)
                .Include(m => m.Student)
                .FirstOrDefaultAsync(m => m.Id == mentorshipId && m.MentorId == mentorId)
                ?? throw new NotFoundException("Mentorship request not found");

            if (mentorship.Status != MentorshipStatus.Pending)
                throw new BadRequestException("Mentorship is not in pending status");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (accept)
                {
                    // Get all other pending requests from this student
                    var otherPendingRequests = await _context.Mentorships
                        .Where(m => m.StudentId == mentorship.StudentId
                            && m.Id != mentorship.Id
                            && m.Status == MentorshipStatus.Pending)
                        .ToListAsync();

                    // Remove all other pending requests
                    _context.Mentorships.RemoveRange(otherPendingRequests);

                    // Accept current request
                    mentorship.Status = MentorshipStatus.Active;
                    mentorship.StartDate = DateTime.UtcNow;
                    mentorship.EndDate = CalculateEndDate(DateTime.UtcNow, mentorship.Duration);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return await GetMentorshipResponseDto(mentorship.Id);
                }
                else
                {
                    _context.Mentorships.Remove(mentorship);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return null;
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        // Get AI-based mentor recommendations for a student
        public async Task<List<MentorRecommendationDto>> GetMentorRecommendationsAsync(Guid studentId)
        {
            var student = await _context.Users
                .Include(u => u.WillingToLearnSkills)
                    .ThenInclude(w => w.Skill)
                .FirstOrDefaultAsync(u => u.Id == studentId)
                ?? throw new NotFoundException("Student not found");

            var availableMentors = await GetAllMentorsAsync();
            var recommendations = new List<MentorRecommendationDto>();

            foreach (var mentor in availableMentors)
            {
                var matchingSkills = mentor.Skills
                    .Select(s => s.Name)
                    .Intersect(student.WillingToLearnSkills.Select(w => w.Skill.name))
                    .ToList();

                var additionalSkills = mentor.Skills
                    .Select(s => s.Name)
                    .Except(matchingSkills)
                    .ToList();

                if (matchingSkills.Any())
                {
                    // Use Gemini to generate personalized recommendation
                    var recommendationReason = await GetAIRecommendation(
                        student.FirstName, student.LastName,
                        mentor.FirstName, mentor.LastName,
                        matchingSkills,
                        additionalSkills,
                        mentor.CurrentJobTitle?.Name);

                    recommendations.Add(new MentorRecommendationDto
                    {
                        Mentor = mentor,
                        MatchScore = CalculateMatchScore(matchingSkills.Count, additionalSkills.Count),
                        MatchingSkills = matchingSkills,
                        AdditionalSkills = additionalSkills,
                        RecommendationReason = recommendationReason
                    });
                }
            }

            return recommendations.OrderByDescending(r => r.MatchScore).ToList();
        }

        // Helper methods
        private DateTime CalculateEndDate(DateTime startDate, MentorshipDuration duration)
        {
            return duration switch
            {
                MentorshipDuration.OneMonth => startDate.AddMonths(1),
                MentorshipDuration.TwoMonths => startDate.AddMonths(2),
                MentorshipDuration.ThreeMonths => startDate.AddMonths(3),
                _ => throw new ArgumentException("Invalid duration")
            };
        }

        private async Task<MentorshipResponseDto> GetMentorshipResponseDto(Guid mentorshipId)
        {
            var mentorship = await _context.Mentorships
                .Include(m => m.Mentor)
                .Include(m => m.Student)
                .FirstOrDefaultAsync(m => m.Id == mentorshipId)
                ?? throw new NotFoundException("Mentorship not found");

            return new MentorshipResponseDto
            {
                Id = mentorship.Id,
                Mentor = new UserDto
                {
                    Id = mentorship.Mentor.Id,
                    Email = mentorship.Mentor.Email,
                    FirstName = mentorship.Mentor.FirstName,
                    LastName = mentorship.Mentor.LastName,
                    Role = mentorship.Mentor.Role,
                    Bio = mentorship.Mentor.Bio,
                    ProfileImageUrl = mentorship.Mentor.ProfileImageUrl
                },
                Student = new UserDto
                {
                    Id = mentorship.Student!.Id,
                    Email = mentorship.Student.Email,
                    FirstName = mentorship.Student.FirstName,
                    LastName = mentorship.Student.LastName,
                    Role = mentorship.Student.Role,
                    Bio = mentorship.Student.Bio,
                    ProfileImageUrl = mentorship.Student.ProfileImageUrl
                },
                Status = mentorship.Status,
                Duration = mentorship.Duration,
                StartDate = mentorship.StartDate,
                EndDate = mentorship.EndDate
            };
        }

        private double CalculateMatchScore(int matchingSkillsCount, int additionalSkillsCount)
        {
            // Simple scoring algorithm - can be made more sophisticated
            double matchScore = matchingSkillsCount * 0.7 + additionalSkillsCount * 0.3;
            return Math.Min(matchScore / 10, 1.0); // Normalize to 0-1
        }

        private async Task<string> GetAIRecommendation(
            string studentFirstName, string studentLastName,
            string mentorFirstName, string mentorLastName,
            List<string> matchingSkills,
            List<string> additionalSkills,
            string? mentorJobTitle)
        {
            var prompt = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = $@"Act as a mentorship matching expert. Generate a personalized recommendation 
                                explaining why {mentorFirstName} {mentorLastName} would be a good mentor for 
                                {studentFirstName} {studentLastName}.
                                Consider these matching skills: {string.Join(", ", matchingSkills)}
                                Additional skills they could learn: {string.Join(", ", additionalSkills)}
                                Mentor's current job: {mentorJobTitle ?? "Not specified"}
                                Keep the response concise but persuasive, focusing on the value of this potential mentorship."
                            }
                        }
                    }
                }
            };

            var response = await _httpClient.PostAsJsonAsync(GEMINI_API_URL, prompt);
            var result = await response.Content.ReadFromJsonAsync<GeminiResponse>();

            return result?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text
                ?? "Unable to generate recommendation at this time.";
        }


        // Helper class for Gemini API response
        private class GeminiResponse
        {
            public List<Candidate>? candidates { get; set; }
        }

        private class Candidate
        {
            public Content? content { get; set; }
        }

        private class Content
        {
            public List<Part>? parts { get; set; }
        }

        private class Part
        {
            public string? text { get; set; }
        }

        public async Task<List<MentorshipResponseDto>> GetCurrentMentorshipsAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.MentorMentorships)
                    .ThenInclude(m => m.Student)
                .Include(u => u.StudentMentorships)
                    .ThenInclude(m => m.Mentor)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException("User not found");

            var mentorships = user.Role == UserRole.Mentor
                ? user.MentorMentorships
                : user.StudentMentorships;

            return mentorships.Select(m => new MentorshipResponseDto
            {
                Id = m.Id,
                Mentor = new UserDto
                {
                    Id = m.Mentor.Id,
                    Email = m.Mentor.Email,
                    FirstName = m.Mentor.FirstName,
                    LastName = m.Mentor.LastName,
                    Role = m.Mentor.Role,
                    Bio = m.Mentor.Bio,
                    ProfileImageUrl = m.Mentor.ProfileImageUrl
                },
                Student = new UserDto
                {
                    Id = m.Student!.Id,
                    Email = m.Student.Email,
                    FirstName = m.Student.FirstName,
                    LastName = m.Student.LastName,
                    Role = m.Student.Role,
                    Bio = m.Student.Bio,
                    ProfileImageUrl = m.Student.ProfileImageUrl
                },
                Status = m.Status,
                Duration = m.Duration,
                StartDate = m.StartDate,
                EndDate = m.EndDate
            }).ToList();
        }

        // Add this method to be called by a background job
        public async Task CheckAndUpdateMentorshipStatusAsync()
        {
            var activeMentorships = await _context.Mentorships
                .Where(m => m.Status == MentorshipStatus.Active && m.EndDate <= DateTime.UtcNow)
                .ToListAsync();

            foreach (var mentorship in activeMentorships)
            {
                mentorship.Status = MentorshipStatus.Completed;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<MentorshipResponseDto> CompleteMentorshipAsync(Guid userId, Guid mentorshipId)
        {
            var mentorship = await _context.Mentorships
                .Include(m => m.Mentor)
                .Include(m => m.Student)
                .FirstOrDefaultAsync(m => m.Id == mentorshipId)
                ?? throw new NotFoundException("Mentorship not found");

            // Verify user is either mentor or student of this mentorship
            if (mentorship.MentorId != userId && mentorship.StudentId != userId)
            {
                throw new UnauthorizedException("You can only complete mentorships you are part of");
            }

            // Only active mentorships can be completed
            if (mentorship.Status != MentorshipStatus.Active)
            {
                throw new BadRequestException($"Cannot complete mentorship in {mentorship.Status} status");
            }

            mentorship.Status = MentorshipStatus.Completed;
            mentorship.EndDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetMentorshipResponseDto(mentorship.Id);
        }

        public async Task<List<Mentorship>> GetStudentPendingRequestsAsync(Guid studentId)
        {
            return await _context.Mentorships
                .Where(m => m.StudentId == studentId && m.Status == MentorshipStatus.Pending)
                .ToListAsync();
        }

        public async Task DeleteStudentPendingRequestsAsync(Guid studentId)
        {
            var pendingRequests = await GetStudentPendingRequestsAsync(studentId);
            _context.Mentorships.RemoveRange(pendingRequests);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}