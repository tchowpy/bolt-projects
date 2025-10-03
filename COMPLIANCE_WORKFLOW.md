# Compliance Checks - Guide Complet d'Utilisation

**Date:** 2025-10-03  
**Module:** Compliance & Risk Management

---

## 📋 COMMENT LES DONNÉES SONT INSÉRÉES

Il existe maintenant **2 méthodes** pour insérer des compliance checks:

### Méthode 1: Interface Utilisateur (NOUVEAU) ✅

**Étapes:**

1. **Aller dans Compliance Module**
   ```
   Dashboard → Compliance dans le menu latéral
   ```

2. **Cliquer sur "New Check"**
   - Bouton bleu en haut à droite de l'onglet "Compliance Checks"
   - Un modal s'ouvre avec le formulaire

3. **Remplir le Formulaire:**
   - **Client*** : Sélectionner dans la liste (50 clients actifs disponibles)
   - **Check Type*** : Choisir le type de vérification
     - KYC Verification
     - AML Screening
     - Credit Score
     - Document Verification
   - **Status*** : Définir le statut initial
     - Pending (défaut - pour traitement ultérieur)
     - Passed (si déjà approuvé)
     - Failed (si déjà rejeté)
     - Review Required (nécessite examen)
   - **Score** : Optionnel, note de 0 à 100
   - **Details/Notes** : Optionnel, informations complémentaires

4. **Soumettre**
   - Cliquer "Create Check"
   - Le check apparaît immédiatement dans la liste

**Avantages:**
- ✅ Interface graphique intuitive
- ✅ Validation des données
- ✅ Liste déroulante de clients
- ✅ Pas besoin de connaître SQL
- ✅ Mise à jour automatique de la liste

---

### Méthode 2: Insertion SQL Directe

**Pour les administrateurs ou imports en masse:**

```sql
INSERT INTO compliance_checks (
  client_id, 
  check_type, 
  status, 
  score, 
  checked_at, 
  details
)
VALUES (
  'uuid-du-client',
  'kyc',                    -- ou 'aml', 'credit_score', 'document_verification'
  'pending',                -- ou 'passed', 'failed', 'review_required'
  85,                       -- score optionnel (0-100)
  NOW(),                    -- si déjà vérifié, sinon NULL
  '{"note": "Documents received"}'::jsonb
);
```

**Types de Check Valides:**
- `kyc` - KYC Verification
- `aml` - AML Screening
- `credit_score` - Credit Score
- `document_verification` - Document Verification

**Statuts Valides:**
- `pending` - En attente de traitement
- `passed` - Approuvé
- `failed` - Rejeté
- `review_required` - Nécessite un examen

---

## 🔄 WORKFLOW COMPLET DE TRAITEMENT

### Étape 1: Création du Check

**Via UI:**
```
Compliance → New Check → Remplir formulaire → Create Check
```

**Données créées:**
```json
{
  "id": "auto-généré",
  "client_id": "uuid-du-client",
  "check_type": "kyc",
  "status": "pending",
  "score": null,
  "checked_at": null,
  "details": {"note": "Awaiting documents"},
  "created_at": "2025-10-03T..."
}
```

### Étape 2: Le Check Apparaît dans la Liste

**Onglet "Compliance Checks"**
- Le nouveau check s'affiche en haut (tri par date DESC)
- Status badge coloré indique l'état
- Boutons d'action disponibles selon le statut

### Étape 3: Traitement du Check

**Pour les checks "pending" ou "review_required":**

1. **Examiner les détails:**
   - Nom du client
   - Type de vérification
   - Score (si disponible)
   - Date de création

2. **Décider l'action:**
   
   **Option A: Approuver**
   ```
   Cliquer "Approve" → Status devient "passed"
   checked_at est automatiquement rempli
   ```
   
   **Option B: Rejeter**
   ```
   Cliquer "Reject" → Status devient "failed"
   checked_at est automatiquement rempli
   ```

3. **Résultat:**
   - Status mis à jour instantanément
   - Badge coloré change
   - Boutons disparaissent (devient "Completed")
   - Date de vérification enregistrée

---

## 🎯 CAS D'USAGE PRATIQUES

### Cas 1: Nouveau Client - KYC Initial

**Scénario:** Un nouveau client s'inscrit, vérification KYC nécessaire

**Actions:**
1. Compliance → New Check
2. Sélectionner le client
3. Type: "KYC Verification"
4. Status: "pending"
5. Score: Laisser vide
6. Notes: "New client - documents submitted"
7. Create Check

**Résultat:**
- Check créé avec status "pending"
- Apparaît dans la liste avec boutons Approve/Reject
- Agent de conformité peut traiter quand documents reçus

---

### Cas 2: Screening AML Automatique

**Scénario:** Système externe a fait un screening AML, score généré

**Actions:**
1. Compliance → New Check
2. Sélectionner le client
3. Type: "AML Screening"
4. Status: "review_required" (score borderline)
5. Score: 65 (sur 100)
6. Notes: "Automated screening - manual review needed"
7. Create Check

**Résultat:**
- Check créé avec status "review_required"
- Score visible (65/100)
- Agent peut examiner et Approve/Reject

---

### Cas 3: Vérification Documents

**Scénario:** Client a soumis documents d'identité

**Actions:**
1. Compliance → New Check
2. Sélectionner le client
3. Type: "Document Verification"
4. Status: "pending"
5. Score: Laisser vide
6. Notes: "ID card and proof of address received"
7. Create Check

**Traitement:**
1. Agent examine les documents physiques
2. Si OK: Click "Approve" → Status "passed"
3. Si problème: Click "Reject" → Status "failed"

---

### Cas 4: Import Massif (SQL)

**Scénario:** 100 clients nécessitent vérification KYC

**Actions:**
```sql
-- Créer checks pour tous les clients actifs sans KYC récent
INSERT INTO compliance_checks (client_id, check_type, status, details)
SELECT 
  c.id,
  'kyc',
  'pending',
  '{"note": "Periodic KYC review required"}'::jsonb
FROM clients c
WHERE c.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM compliance_checks cc 
    WHERE cc.client_id = c.id 
      AND cc.check_type = 'kyc'
      AND cc.checked_at > NOW() - INTERVAL '6 months'
  );
```

**Résultat:**
- Checks créés en masse
- Tous avec status "pending"
- Équipe peut traiter progressivement via UI

---

## 📊 STATISTIQUES ET MONITORING

**Dashboard Stats:**
```
Total Checks: Nombre total de vérifications
Passed: ✅ Vérifications approuvées
Failed: ❌ Vérifications rejetées
Pending: ⏳ En attente de traitement
Critical Alerts: 🚨 Alertes nécessitant action immédiate
```

**Filtrage:**
- Les checks sont triés par date de création (DESC)
- Limite de 50 checks affichés
- Les plus récents apparaissent en premier

---

## 🔐 SÉCURITÉ ET PERMISSIONS

**RLS Policies:**
```sql
-- Tous les utilisateurs authentifiés peuvent:
- Voir tous les compliance checks (SELECT)
- Créer de nouveaux checks (INSERT)
- Mettre à jour les checks (UPDATE)
```

**Raison:** 
- L'application nécessite que le personnel de conformité ait accès complet
- L'authentification garantit que seuls les utilisateurs autorisés accèdent au système
- Policies plus restrictives peuvent être ajoutées ultérieurement par agence

---

## ✅ VALIDATION DES DONNÉES

**Contraintes de Base de Données:**

1. **check_type** doit être:
   - 'kyc'
   - 'aml'
   - 'credit_score'
   - 'document_verification'

2. **status** doit être:
   - 'pending'
   - 'passed'
   - 'failed'
   - 'review_required'

3. **score** (si fourni):
   - Doit être entre 0 et 100
   - Peut être NULL

4. **client_id**:
   - Doit référencer un client existant (FK)
   - Ne peut pas être NULL

5. **details**:
   - Type: JSONB
   - Peut être NULL
   - Format recommandé: `{"note": "texte libre"}`

---

## 🚀 INTÉGRATIONS POSSIBLES

### Webhook pour Système Externe

**Scénario:** Système AML externe envoie résultats

**Solution:** Créer une Edge Function Supabase

```typescript
// supabase/functions/aml-webhook/index.ts
Deno.serve(async (req: Request) => {
  const { client_id, score, status } = await req.json();
  
  await supabase.from('compliance_checks').insert({
    client_id,
    check_type: 'aml',
    status: score > 70 ? 'passed' : 'review_required',
    score,
    checked_at: new Date().toISOString(),
    details: { note: 'Automated AML screening' }
  });
  
  return new Response('OK');
});
```

### Automation Quotidienne

**Créer checks automatiques tous les jours:**

```sql
-- Fonction planifiée (via pg_cron ou externe)
CREATE OR REPLACE FUNCTION create_daily_kyc_checks()
RETURNS void AS $$
BEGIN
  INSERT INTO compliance_checks (client_id, check_type, status, details)
  SELECT 
    id,
    'kyc',
    'pending',
    '{"note": "Daily automated KYC check"}'::jsonb
  FROM clients
  WHERE status = 'active'
    AND created_at::date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

---

## 📝 RÉSUMÉ

**Création des Checks:**
1. ✅ Interface UI avec bouton "New Check"
2. ✅ Insertion SQL directe pour bulk operations
3. ✅ Webhooks/API pour intégrations externes

**Traitement:**
1. ✅ Liste affiche tous les checks
2. ✅ Boutons Approve/Reject pour checks pending/review
3. ✅ Status et date mis à jour automatiquement
4. ✅ Badge coloré indique l'état

**Workflow Complet:**
```
Création → Affichage → Traitement → Mise à jour → Archivage
```

**Status:** ✅ SYSTÈME COMPLET ET FONCTIONNEL
