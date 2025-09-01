import random

from company.models import Company, ForumCompany
from recruiters.models import Recruiter, Offer


# Catalogue de 50 offres réalistes avec secteur fixé
OFFER_CATALOG = [
    {"title": "Développeur Full-Stack React/Node.js", "sector": "IT", "description": "Concevoir et développer des fonctionnalités web de bout en bout, du frontend React aux APIs Node.js.", "profile": "3+ ans en JS/TS, React, Node.js, REST/GraphQL, tests, CI/CD."},
    {"title": "Data Scientist Python", "sector": "IT", "description": "Modéliser des problèmes métiers et déployer des modèles prédictifs en production.", "profile": "MSc data/ML, Python, scikit-learn, SQL, cloud, MLOps apprécié."},
    {"title": "Ingénieur DevOps AWS", "sector": "IT", "description": "Automatiser les déploiements, gérer l'infrastructure as code et monitorer la plateforme cloud.", "profile": "AWS, Docker/Kubernetes, Terraform, CI/CD, observabilité."},
    {"title": "Expert Cybersécurité", "sector": "IT", "description": "Sécuriser systèmes, applications et réseaux, piloter la gestion des vulnérabilités.", "profile": "5+ ans, ISO27001, pentest, EDR/SIEM, CISSP/CEH un plus."},
    {"title": "Ingénieur Cloud Azure", "sector": "IT", "description": "Définir des architectures cloud robustes et optimiser coûts/performance.", "profile": "Azure, IaC (Bicep/Terraform), sécurité cloud, finops."},
    {"title": "SRE (Site Reliability Engineer)", "sector": "IT", "description": "Améliorer la fiabilité des services et l'efficacité opérationnelle.", "profile": "SLO/SLI, Kubernetes, observabilité, incident response."},
    {"title": "Architecte Logiciel", "sector": "IT", "description": "Concevoir des architectures modulaires, scalables et sécurisées.", "profile": "Microservices, DDD, event-driven, sécurité, performance."},
    {"title": "Machine Learning Engineer", "sector": "IT", "description": "Industrialiser les modèles ML et bâtir des pipelines de features et de déploiement.", "profile": "Python, MLflow, Airflow, Spark, Docker/K8s."},
    {"title": "Développeur Backend Java Spring", "sector": "IT", "description": "Développer des services backend robustes et des APIs performantes.", "profile": "Java 17+, Spring Boot, JPA, Kafka, SQL/NoSQL."},
    {"title": "Développeur Frontend React", "sector": "IT", "description": "Construire des interfaces web performantes et accessibles.", "profile": "React, TypeScript, tests, performance/UX."},
    {"title": "QA Automation Engineer", "sector": "IT", "description": "Mettre en place des stratégies de tests automatisés.", "profile": "Cypress/Playwright, API testing, CI/CD."},
    {"title": "Product Owner IT", "sector": "IT", "description": "Porter la vision produit et maximiser la valeur.", "profile": "Backlog, discovery, métriques, agilité."},
    {"title": "Scrum Master IT", "sector": "IT", "description": "Faciliter les rituels et améliorer la vélocité.", "profile": "Scrum/Kanban, coaching, metrics."},
    {"title": "Data Engineer", "sector": "IT", "description": "Construire et maintenir des pipelines de données.", "profile": "Python/Scala, Spark, ETL, cloud, orchestration."},
    {"title": "Data Analyst BI", "sector": "IT", "description": "Analyser la donnée et produire des dashboards.", "profile": "SQL, Power BI/Tableau, modélisation."},
    {"title": "Développeur Mobile Android", "sector": "IT", "description": "Développer des applications Android.", "profile": "Kotlin, MVVM, tests, UX mobile."},
    {"title": "Développeur iOS Swift", "sector": "IT", "description": "Concevoir des apps iOS de qualité production.", "profile": "Swift/SwiftUI, tests, CI mobile."},
    {"title": "Ingénieur QA / Test", "sector": "IT", "description": "Définir et exécuter des plans de tests.", "profile": "Test design, automatisation, bug tracking."},
    {"title": "Ingénieur Logiciel C++", "sector": "IT", "description": "Développer des composants C++ haute performance.", "profile": "C++17, STL, multithreading, Linux."},
    {"title": ".NET Core Developer", "sector": "IT", "description": "Concevoir des APIs et services en .NET Core.", "profile": ".NET 6+, ASP.NET Core, EF Core."},
    {"title": "Ingénieur Réseaux", "sector": "IT", "description": "Administrer et sécuriser l'infrastructure réseau.", "profile": "Cisco, routing/switching, firewall."},
    {"title": "Admin Systèmes Linux", "sector": "IT", "description": "Maintenir et sécuriser Linux en production.", "profile": "Linux, shell, Ansible, supervision."},
    {"title": "Pentester", "sector": "IT", "description": "Réaliser des tests d'intrusion et audits.", "profile": "OWASP, burp, exploit, reporting."},
    {"title": "DBA / Administrateur BDD", "sector": "IT", "description": "Exploiter et optimiser des bases de données.", "profile": "PostgreSQL/MySQL, tuning, sauvegarde."},
    {"title": "Ingénieur IoT", "sector": "IT", "description": "Concevoir des solutions IoT (device → cloud).", "profile": "MQTT, edge, sécurité, protocoles."},
    {"title": "Développeur Python Django", "sector": "IT", "description": "Développer des applications web et APIs.", "profile": "Python, Django/DRF, ORM, tests."},
    {"title": "Développeur Go (Golang)", "sector": "IT", "description": "Construire des services performants en Go.", "profile": "Go, microservices, gRPC/REST."},
    {"title": "Ingénieur Big Data", "sector": "IT", "description": "Mettre en œuvre des architectures data massives.", "profile": "Hadoop/Spark, Kafka, data lakehouse."},
    {"title": "Architecte Cloud GCP", "sector": "IT", "description": "Concevoir des architectures GCP sécurisées.", "profile": "GCP, GKE, Dataflow, IaC."},
    {"title": "Chef de Projet IT", "sector": "IT", "description": "Piloter des projets IT, planning, risques, budget.", "profile": "PMO, agilité/hybride, pilotage fournisseurs."},
    {"title": "Ingénieur MLOps", "sector": "IT", "description": "Opérationnaliser le cycle de vie des modèles ML.", "profile": "CI/CD ML, monitoring, containers, cloud."},
    {"title": "Data Platform Engineer", "sector": "IT", "description": "Construire la plateforme data (stockage, traitement).", "profile": "SQL/NoSQL, orchestration, sécurité."},
    {"title": "Ingénieur Kubernetes", "sector": "IT", "description": "Opérer des clusters K8s en production.", "profile": "Ingress, autoscaling, GitOps, policy."},
    {"title": "Développeur Rust", "sector": "IT", "description": "Développer des composants systèmes en Rust.", "profile": "Async, tests, sécurité mémoire."},
    {"title": "Ingénieur Salesforce", "sector": "IT", "description": "Développer sur l'écosystème Salesforce.", "profile": "Apex, LWC, intégrations, sécurité."},
    {"title": "Développeur Angular", "sector": "IT", "description": "Développer des interfaces Angular.", "profile": "Angular, RxJS, NgRx, tests."},
    {"title": "Data Steward", "sector": "IT", "description": "Garantir la qualité et la gouvernance de la donnée.", "profile": "Qualité, lineage, RGPD."},
    {"title": "Ingénieur Sécurité Cloud", "sector": "IT", "description": "Déployer des contrôles de sécurité cloud.", "profile": "CSPM, IAM, chiffrement, zero trust."},
    {"title": "Product Manager Tech", "sector": "IT", "description": "Piloter la roadmap d’un produit technique.", "profile": "Discovery, priorisation, métriques."},
    {"title": "Tech Lead Backend", "sector": "IT", "description": "Encadrer l’équipe backend et les standards.", "profile": "Design review, performance, mentoring."},
    {"title": "Ingénieur QA Performance", "sector": "IT", "description": "Mesurer et optimiser la performance.", "profile": "JMeter/k6, APM, tuning."},
    {"title": "Ingénieur Intégration Continue", "sector": "IT", "description": "Standardiser les pipelines CI/CD.", "profile": "GitHub Actions/GitLab CI, scans sécurité."},
    {"title": "Développeur PHP Symfony", "sector": "IT", "description": "Développer des back‑offices en Symfony.", "profile": "PHP8, Symfony, Doctrine, tests."},
    {"title": "Développeur Flutter", "sector": "IT", "description": "Concevoir des apps mobiles cross‑platform.", "profile": "Dart/Flutter, state management, CI."},
    {"title": "Ingénieur ETL", "sector": "IT", "description": "Mettre en place des flux ETL/ELT.", "profile": "Talend/DBT, SQL, qualité, monitoring."},
    {"title": "Responsable Marketing Digital", "sector": "Marketing", "description": "Définir la stratégie d'acquisition et piloter les canaux.", "profile": "SEO/SEA, analytics, automation, ROI."},
    {"title": "Analyste Financier", "sector": "Finance", "description": "Analyser la performance et modéliser.", "profile": "Excel/BI, IFRS, communication claire."},
    {"title": "Business Developer", "sector": "Commerce", "description": "Prospecter et signer des clients B2B.", "profile": "Chasseur(se), CRM, pitch, négociation."},
    {"title": "Chargé de Recrutement", "sector": "RH", "description": "Conduire le process de recrutement.", "profile": "Sourcing, entretiens, ATS, expérience candidat."},
    {"title": "Chef de Projet Clinique", "sector": "Santé", "description": "Coordonner les essais cliniques.", "profile": "Réglementaire, qualité, gestion d'études."},
    {"title": "Chef de Projet e‑learning", "sector": "Éducation", "description": "Concevoir des parcours e‑learning.", "profile": "Pédagogie, LMS, outils auteur."},
    # Marketing (compléments)
    {"title": "Brand Manager", "sector": "Marketing", "description": "Définir le positionnement de marque et orchestrer les lancements.", "profile": "Branding, études, planning stratégique, coordination 360."},
    {"title": "CRM Manager", "sector": "Marketing", "description": "Déployer les scénarios CRM pour activer et fidéliser les clients.", "profile": "Segmentation, marketing automation, A/B tests, reporting."},
    {"title": "Paid Media Manager", "sector": "Marketing", "description": "Piloter les investissements média et optimiser le mix paid.", "profile": "Google Ads, Meta, programmatique, mesure d'attribution."},
    # Finance (compléments)
    {"title": "Trésorier", "sector": "Finance", "description": "Gérer la trésorerie, la liquidité et les risques de change.", "profile": "Cash‑management, prévisions, instruments financiers."},
    {"title": "Auditeur Interne", "sector": "Finance", "description": "Conduire des missions d'audit et formuler des recommandations.", "profile": "Méthodologie d'audit, contrôle interne, restitution claire."},
    {"title": "Risk Manager", "sector": "Finance", "description": "Cartographier et piloter les risques financiers et opérationnels.", "profile": "ERM, appétence au risque, plans de mitigation, KPI."},
    # Commerce (compléments)
    {"title": "Responsable Commercial", "sector": "Commerce", "description": "Définir la stratégie commerciale et encadrer l'équipe sales.", "profile": "Leadership, forecast, coaching, négociation grands comptes."},
    {"title": "Inside Sales", "sector": "Commerce", "description": "Qualifier les leads, réaliser des démos et convertir à distance.", "profile": "Prospection, qualification, closing, gestion pipeline."},
    {"title": "Chef de Secteur", "sector": "Commerce", "description": "Développer les ventes et l'implantation en GMS/retail.", "profile": "Négociation, merchandising, connaissance terrain."},
    # RH (compléments)
    {"title": "Responsable RH", "sector": "RH", "description": "Piloter les cycles RH et les relations sociales.", "profile": "Droit social, process RH, posture de partenaire business."},
    {"title": "People Ops Manager", "sector": "RH", "description": "Améliorer l'efficacité opérationnelle RH et les processus.", "profile": "Process, outillage, data RH, conduite du changement."},
    {"title": "Learning & Development Manager", "sector": "RH", "description": "Construire l'offre de formation et mesurer l'impact.", "profile": "Ingénierie pédagogique, budget, pilotage d'indicateurs."},
    # Santé (compléments)
    {"title": "Biostatisticien", "sector": "Santé", "description": "Analyser des données cliniques et modéliser l'efficacité.", "profile": "Statistiques, R/Python, GCP, rigueur scientifique."},
    {"title": "Responsable Qualité Clinique", "sector": "Santé", "description": "Garantir la qualité et la conformité des études cliniques.", "profile": "Qualité, CAPA, audits, gestion documentaire."},
    # Éducation (compléments)
    {"title": "Instructional Designer", "sector": "Éducation", "description": "Concevoir des modules pédagogiques engageants.", "profile": "Storyline/Captivate, scénarisation, UX d'apprentissage."},
    {"title": "Responsable Pédagogique", "sector": "Éducation", "description": "Piloter l'offre de formation et l'accompagnement des formateurs.", "profile": "Pédagogie, ingénierie de parcours, qualité, évaluation."},
    # BTP
    {"title": "Conducteur de Travaux", "sector": "BTP", "description": "Piloter les chantiers et garantir qualité, coûts, délais.", "profile": "Coordination, sécurité, planification, gestion sous‑traitants."},
    {"title": "Chef de Chantier", "sector": "BTP", "description": "Encadrer les équipes sur site et assurer l'avancement.", "profile": "Management terrain, sécurité, lecture de plans."},
    {"title": "Ingénieur Études BTP", "sector": "BTP", "description": "Réaliser les études techniques et les métrés.", "profile": "Calculs, DAO, normes, chiffrage et dossiers techniques."},
    # Logistique
    {"title": "Responsable Supply Chain", "sector": "Logistique", "description": "Optimiser la chaîne d'approvisionnement de bout en bout.", "profile": "S&OP, planification, WMS/TMS, amélioration continue."},
    {"title": "Gestionnaire Logistique", "sector": "Logistique", "description": "Gérer les flux, stocks et expéditions.", "profile": "Organisation, KPI, maîtrise des outils et process logistiques."},
    {"title": "Planificateur Flux", "sector": "Logistique", "description": "Planifier la production et équilibrer les charges.", "profile": "MRP, prévisions, coordination multi‑équipes."},
    # Technologie (hors IT pur)
    {"title": "Ingénieur Systèmes Embarqués", "sector": "Technologie", "description": "Concevoir des logiciels embarqués temps réel.", "profile": "C/C++, RTOS, communication, validation embarquée."},
    {"title": "Architecte IoT Industriel", "sector": "Technologie", "description": "Définir l'architecture d'une plate‑forme IoT à l'échelle.", "profile": "Edge, sécurité, protocoles industriels, intégrations."},
    {"title": "Ingénieur Robotique", "sector": "Technologie", "description": "Développer des fonctionnalités robotisées et perception.", "profile": "ROS, vision, contrôle/commande, calibration."},
]


def run():
    print("💼 Génération des offres avec secteurs fixes (50+).")
    print("🗑️ Suppression des offres existantes...")
    Offer.objects.all().delete()

    locations = [
        "Paris", "Lyon", "Marseille", "Toulouse", "Nantes", "Bordeaux",
        "Lille", "Strasbourg", "Nice", "Rennes"
    ]

    contract_types = [
        "CDI", "CDD", "Stage", "Contrat d'apprentissage", "Contrat de professionnalisation"
    ]

    # plus d'inférence: on s'appuie sur le secteur fixé du catalogue
    def choose_company_for_sector(companies, sector: str):
        matching = [c for c in companies if (c.sectors or []) and sector in c.sectors]
        return random.choice(matching) if matching else random.choice(companies)

    # Textes d'enrichissement par secteur (ajoutés aux contenus de base)
    SECTOR_EXTRA_DESC = {
        "IT": (
            "Vous interviendrez au sein d'équipes produit cross‑fonctionnelles (design, QA, data) "
            "dans un environnement agile (Scrum/Kanban). Vous participerez aux revues d'architecture, "
            "à l'amélioration continue (code review, tests automatisés) et au déploiement en continu "
            "sur des plateformes cloud (AWS/Azure/GCP). L'objectif est de livrer des solutions fiables, "
            "sécurisées et performantes, à forte valeur pour les utilisateurs."
        ),
        "Marketing": (
            "Vous construirez des plans d'acquisition et de rétention orientés KPI (CPL, CAC, LTV), "
            "piloterez les campagnes multi‑canales (SEO/SEA, social, email, content) et collaborerez avec "
            "les équipes Sales et Produit pour aligner messages et positionnement. Vous assurerez une "
            "veille concurrentielle et motionnerez des A/B tests pour optimiser en continu."
        ),
        "Finance": (
            "Au sein de la direction financière, vous produirez analyses mensuelles, budgets et re‑forecasts, "
            "réaliserez des modèles de sensibilité et participerez aux comités de pilotage. Vous garantirez "
            "la fiabilité des données et la conformité (IFRS/PCG) en lien avec les auditeurs."
        ),
        "Commerce": (
            "Vous adresserez un portefeuille de comptes stratégiques, de la prospection au closing. "
            "Vous construirez des plans de compte, orchestrerez les démonstrations, rédigerez les propositions "
            "et négocierez les conditions dans une logique de partenariat long‑terme."
        ),
        "RH": (
            "Vous accompagnerez les managers sur l'ensemble du cycle de vie collaborateur: recrutement, "
            "onboarding, performance, formation et développement. Vous suivrez les KPIs RH et proposerez "
            "des actions d'amélioration continue des process et de la marque employeur."
        ),
        "Santé": (
            "Vous interviendrez dans un contexte fortement réglementé et data‑driven, en interaction avec "
            "les équipes médicales, qualité et réglementaire. Vous garantirez la conformité, la traçabilité "
            "et la qualité des livrables tout au long des projets."
        ),
        "Éducation": (
            "Vous concevrez des dispositifs pédagogiques engageants (synchrone/asynchrone) et mesurerez "
            "l'impact via des indicateurs d'apprentissage. Vous collaborerez avec des experts métiers pour "
            "co‑produire des parcours certifiants et inclusifs."
        ),
    }

    SECTOR_EXTRA_PROFILE = {
        "IT": (
            "Solide culture d'ingénierie (clean code, tests, sécurité), maîtrise d'un cloud (AWS/Azure/GCP), "
            "outillage DevOps/CI‑CD et collaboration efficace au sein d'équipes agiles. Capacité à documenter, "
            "à challenger des choix techniques et à vulgariser des sujets complexes."
        ),
        "Marketing": (
            "Orientation data (tracking, attribution), excellente expression écrite/orale en français, "
            "maîtrise d'outils (GA4, Tag Manager, Ads, CRM/Marketing Automation) et sens du ROI."
        ),
        "Finance": (
            "Exigence et rigueur, très bon niveau Excel/BI, aisance sur la modélisation financière et la "
            "présentation de synthèses pour le top management."
        ),
        "Commerce": (
            "Tempérament chasseur(euse) et sens du service, maîtrise des méthodes de vente (SPIN/BANT/Challenger), "
            "utilisation avancée du CRM et gestion de cycles complexes."
        ),
        "RH": (
            "Empathie et impact, connaissance des processus RH et de la législation, maîtrise d'un ATS, "
            "capacité à mener des entretiens structurés et à piloter des projets transverses."
        ),
        "Santé": (
            "Connaissance des référentiels qualité, exigence documentaire, sens de l'éthique et de la "
            "confidentialité, coordination multi‑interlocuteurs."
        ),
        "Éducation": (
            "Pédagogie active, scénarisation, UX d'apprentissage, outils auteur/LMS, évaluation formative "
            "et capacité à itérer à partir des feedbacks apprenants."
        ),
    }

    companies = list(Company.objects.all())
    if not companies:
        print("❌ Aucune entreprise trouvée. Lancez d'abord 'runscript data_db'.")
        return

    created = 0
    for entry in OFFER_CATALOG:
        company = choose_company_for_sector(companies, entry["sector"])
        recruiters = Recruiter.objects.filter(company=company)
        if not recruiters.exists():
            continue
        recruiter = random.choice(list(recruiters))
        forum_link = ForumCompany.objects.filter(company=company).first()
        if not forum_link:
            continue

        extra_desc = SECTOR_EXTRA_DESC.get(entry["sector"], "")
        extra_profile = SECTOR_EXTRA_PROFILE.get(entry["sector"], "")
        long_description = f"{entry['description']}\n\n{extra_desc}" if extra_desc else entry["description"]
        long_profile = f"{entry['profile']}\n\n{extra_profile}" if extra_profile else entry["profile"]

        Offer.objects.create(
            title=entry["title"],
            description=long_description,
            location=random.choice(locations),
            sector=entry["sector"],
            contract_type=random.choice(contract_types),
            profile_recherche=long_profile,
            recruiter=recruiter,
            company=company,
            forum=forum_link.forum,
        )
        created += 1

    print(f"✅ {created} offres créées avec secteurs fixes et réalistes.")

