import json
from datetime import timedelta

from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework import status
from users.models import User, UserToken
from users.utils import send_user_token


signer = TimestampSigner()


def request_password_reset_service(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'success': 'If the email is registered, a reset link will be sent.'})  # Pas d'info sensible

    send_user_token(user, token_type="password_reset")

    return Response({'success': 'If the email is registered, a reset link will be sent.'})


def reset_user_password(request, token):
    try:
        token_str = signer.unsign(token, max_age=60 * 60 * 24)
    except SignatureExpired:
        return Response({'error': 'Token expired'}, status=status.HTTP_400_BAD_REQUEST)
    except BadSignature:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_token = UserToken.objects.get(token=token_str, type="password_reset", is_used=False)
    except UserToken.DoesNotExist:
        return Response({'error': 'Token not found or already used'}, status=status.HTTP_404_NOT_FOUND)

    if user_token.created_at < now() - timedelta(hours=24):
        return Response({'error': 'Token expired'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        data = json.loads(request.body)
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    if not new_password or new_password != confirm_password:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

    user = user_token.user
    user.set_password(new_password)
    user.save()

    user_token.is_used = True
    user_token.save()

    return Response({'success': 'Password has been reset successfully'})


def change_user_password(user, old_password, new_password):
    if not old_password or not new_password:
        return Response({"error": "Both old and new passwords are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect."},
                        status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
