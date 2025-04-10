﻿using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Users.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Users.Events;

public class GetProfileHandler(IProfileRepository profileRepository) : IRequestHandler<GetProfileQuery, ProfileDto>
{
    public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        // check profile exist
        var profile = await profileRepository.GetProfileByUserAsync(request.UserId);
        if (profile is null)
            throw new BusinessException("User does not exist");

        // return data
        return new ProfileDto(profile.Name!, profile.Address, profile.Gender, profile.Avatar);
    }
}