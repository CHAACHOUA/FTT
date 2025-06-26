from rest_framework import status
from company.serializers import CompanySerializer



def get_company_profile(company):
    serializer = CompanySerializer(company)
    return serializer.data
def update_company_profile(company, data, logo=None):
    if logo:
        data['logo'] = logo



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