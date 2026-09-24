
# Ecclesix - Vos Eglises Centralisées, Votre Administration Simplifiée

**Ecclesix** est une application web conçue pour simplifier la gestion des églises, qu’il s’agisse du siège ou des différentes annexes. Son but principal est de centraliser l’administration de toutes les églises, tout en permettant aux responsables locaux de gérer efficacement leurs paroisses grâce à un système de rôles et de permissions. Les pasteurs et dirigeants peuvent ainsi superviser leurs églises dans le cadre défini par le siège.

---

## Fonctionnalités principales

- **Dashboard**  
- **Gestion des membres**  
- **Gestion des départements**  
- **Gestion des églises**  
- **Gestion des événements**  
- **Gestion des finances**  
- **Journal d’administration(Admin Log)**  
- **Système d’authentification**  

---

## 1. **Système d'authentification**  

- **Inscription des administrateurs** : Les nouveaux administrateurs s’inscrivent avec leur e-mail et un mot de passe pour accéder à l’application.  
- **Vérification OTP** : Un code OTP est demandé à chaque connexion pour renforcer la sécurité.  
- **Récupération de mot de passe** : En cas de perte, les administrateurs peuvent réinitialiser leur mot de passe et leur OTP via e-mail.

---

## 2. **Rôles et permissions**  

Le système permet d’attribuer des permissions précises selon les rôles afin de mieux répartir les tâches.

### Niveaux d’accès

- **SuperAdmins** : Accès total à toutes les fonctionnalités de toutes les églises.  
- **Admins** : Accès limité à leur église.  
- **Membres** : N'ont accès au système que s’ils deviennent administrateurs.

**Fonctionnalités clés** :

- Un rôle peut comporter jusqu’à **22 permissions**.  
- Les SuperAdmins peuvent attribuer des permissions spécifiques à différents rôles, offrant ainsi un contrôle précis sur l'accès aux ressources.
- Seuls les **SuperAdmins** peuvent supprimer des membres ; les admins peuvent uniquement les désactiver.

---

## 3. **Dashboard**  

Le tableau de bord présente une vue d’ensemble des statistiques des églises :  

- **Croissance des membres** (6 derniers mois)  
- **Croissance du nombre d'églises** (6 dernières années)  
- **Nombre de ministres** (6 derniers mois)  
- **Statistiques des événements** (6 derniers mois)  
- **Participation par type d’événement** (par mois)  
- **Répartition démographique** : Sexe, âge, profession et statut matrimonial des membres  
- **Infos sur les nouveaux membres** : Les six derniers inscrits  

*Note : Le tableau de bord est accessible à tous les administrateurs sans permission spéciale.*

---

## 4. **Gestion des membres**  

Ce module permet d’ajouter, modifier, supprimer ou désactiver des membres et d’attribuer des rôles.

**Fonctionnalités clés** :  

- Ajouter, désactiver et mettre à jour les informations des membres  
- Attribuer des rôles d’administrateur ou de SuperAdmin  
- Rechercher et filtrer les membres selon des critères tels que l'âge, le sexe, la profession, le statut matrimonial, l'affiliation à l'église, etc.
- Lier les profils via des relations familiales
- Gérer les détails spécifiques à l'administrateur, tels que la dernière connexion, le rôle, et ces activités.

**Permissions** :

- **Ajouter, modifier et voir les membres** : Les administrateurs peuvent gérer les membres de leur église.
- **Voir tous les membres** : Donne accès à la liste de tous les membres de toutes les églises.

---

## 5. **Gestion des départements**  

Chaque église peut créer et gérer ses propres départements.

**Fonctionnalités clés** :  

- Ajouter, modifier ou supprimer des départements  
- Désigner des chef de département  
- Gérer la liste des membres par département  

**Permissions** :

- **Ajouter, modifier, supprimer et voir les départements** : Les administrateurs peuvent gérer les départements de leur église.
- **Permission de chef de département** : Permet de consulter la liste des membres de leur département.
- **Voir tous les départements** : Pour consulter les départements de toutes les églises.

---

## 6. **Gestion des événements**  

Ce module permet de gérer les événements et d’en suivre la participation.  

**Fonctionnalités clés** :  

- Ajouter et modifier des événements  
- Définir les types d'événements et suivre la participation des hommes, des femmes et des enfants.
- Filtrer les événements par date, type et église  
- Visualiser les tendances de participation par semaine ou par mois  

**Permissions** :

- **Ajouter, modifier, supprimer et voir les événements** : Pour les événements de l'église de l'administrateur.
- **Voir tous les événements** : Pour accéder aux événements de toutes les églises.

*Remarque : Les événements ne peuvent être modifiés que dans les 7 jours suivant leur création.*

---

## 7. **Gestion des églises**  

Ce module permet aux superadmins de gérer les églises elles-mêmes, avec la possibilité de créer, modifier et supprimer des églises.

**Fonctionnalités clés** :  

- Ajouter les informations de l’église (nom, adresse, pasteur, type)  
- Les églises sont regroupées par ville.
- Afficher un tableau de bord spécifique pour chaque église avec :  
  - Nombre de membres  
  - Inscription des nouveaux membres (6 derniers mois)  
  - Statistiques des événements (6 derniers mois)
  - Taux de participation hebdomadaire  
  - Répartition démographique des membres

**Permissions** :

- Les superadmins ont un contrôle total, tandis que les administrateurs ayant la permission **Modifier église** peuvent modifier les détails de l'église.

---

## 8. **Gestion des finances**  

Ce module offre un suivi complet des finances de l’église.  

**Fonctionnalités clés** :  

- **Comptes** : Ajouter et gérer des comptes (ex : caisse, banque).  
- **Revenus et dépenses** : Enregistrer les offrandes, dîmes et dépenses, etc...  
- **Approbation des transactions** : Valider ou rejeter les transactions avant de mettre à jour les soldes.  
- **Transferts automatiques** : Configurer des transferts automatiques basés sur des pourcentages entre les comptes selon les catégories de revenus
- **Rapports** : Générer des bilans de revenus et de dépenses.  
- **Budgétisation** : Créer et gérer des budgets pour l'église, allouer des dépenses et suivre l'historique des budgets.
- **Log/Historiques Des Transactions** : Historiques des Transactions, ajout, modification, suppression, ou confirmation/rejection

**Permissions** :

- **Voir Finance et Ajouter transactions** : Les administrateurs peuvent ajouter et consulter les finances de leur église.
- **Permissions de confirmation/rejet** : Pour l'approbation ou le rejet des transactions.
- **Voir log finances** : Pour consulter historiques des transactions.
- **Voir toutes les finances** : Pour consulter les finances de toutes les églises.
-**Ajouter Budget**: Pour creer les budgets

---

## 9. **Journal d’administration (Admin Log)**  

Le journal d’administration enregistre toutes les actions des administrateurs (inscription, ajout, modification, suppression).  

**Fonctionnalités clés** :

- Les journaux sont conservés pendant 10 jours (prolongeables).
- Les actions telles que l'ajout, la modification et la suppression sont entièrement suivies

**Permissions** :

- **Voir Admin Log** : Permet de consulter le Journal d'administration

---

## 10. **Paramètres du système**  

Seuls les SuperAdmins ont accès aux paramètres du système.  

**Fonctionnalités clés** :  

- Gérer les types d’églises, les villes, les types événements, les comptes, les catégories de revenus/dépenses, les catégories de budgets et les règles de transfert automatique.
- Créer et gérer les rôles et permissions.

---

## Conclusion  

 **Ecclesix** centralise la gestion des églises et simplifie l’administration grâce à un système de rôles précis. Il offre aux administrateurs les outils nécessaires pour gérer efficacement leurs responsabilités. Avec une gestion financière complète et des permissions détaillées, **Ecclesix** répond aux besoins d’une organisation ecclésiastique moderne.
