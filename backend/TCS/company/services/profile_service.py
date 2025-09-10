from rest_framework import status
from company.serializers import CompanySerializer
from PIL import Image
import io



def get_company_profile(company):
    serializer = CompanySerializer(company)
    return serializer.data
def validate_image_dimensions(image_file, expected_width, expected_height):
    """Valide les dimensions d'une image"""
    try:
        # Ouvrir l'image avec PIL
        image = Image.open(image_file)
        width, height = image.size
        
        if width != expected_width or height != expected_height:
            return False, f"L'image doit faire exactement {expected_width}x{expected_height} pixels. Dimensions actuelles: {width}x{height}"
        
        return True, None
    except Exception as e:
        return False, f"Erreur lors de la validation de l'image: {str(e)}"

def update_company_profile(company, data, logo=None, banner=None):
    if logo:
        data['logo'] = logo
    if banner:
        data['banner'] = banner



    serializer = CompanySerializer(company, data=data, partial=True)
    print(data)
    if not serializer.is_valid():
        return {
            "status": status.HTTP_400_BAD_REQUEST,
            "data": {"errors": serializer.errors}
        }

    try:
        company = serializer.save()


        return {
            "status": status.HTTP_200_OK,
            "data": CompanySerializer(company).data
        }

    except Exception as e:
        return {
            "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "data": {"message": f"Erreur serveur : {str(e)}"}
        }