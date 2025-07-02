def build_offer_text(offer):
    parts = [
        f"Titre de l'offre : {offer.title}",
        f"Description : {offer.description}",
        f"Secteur : {offer.get_sector_display() if hasattr(offer, 'get_sector_display') else offer.sector}",
        f"Type de contrat : {offer.get_contract_type_display() if hasattr(offer, 'get_contract_type_display') else offer.contract_type}",
        f"Localisation : {offer.location if offer.location else 'Non spécifiée'}",
    ]
    return "\n".join(parts)
