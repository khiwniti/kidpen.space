# Thailand PDPA Compliance for kidpen.space
## Data Protection Requirements for Educational Platform Serving Minors

**Research Date**: 2026-03-30
**Applicable Law**: Personal Data Protection Act B.E. 2562 (2019)
**Effective**: June 1, 2022 (full enforcement)
**Target Users**: Thai students ages 12-18 (minors under Thai law)

---

## Executive Summary

| Requirement | Complexity | Risk Level |
|-------------|------------|------------|
| Dual consent (parent + minor) | High | 🔴 CRITICAL |
| Data minimization | Medium | 🟡 MEDIUM |
| Cross-border transfer | High | 🔴 CRITICAL |
| Right to be forgotten | Medium | 🟡 MEDIUM |
| Data breach notification | Medium | 🟡 MEDIUM |
| Privacy policy (Thai) | Low | 🟢 LOW |

**Key Finding**: PDPA requires parental consent for processing data of minors under 20 years old. However, minors aged 10+ can give consent for certain activities if they have "sufficient understanding."

---

## 1. PDPA Overview

### Scope and Applicability

**PDPA applies when**:
- Collecting personal data in Thailand
- Processing data of Thai residents
- Offering goods/services to people in Thailand
- Monitoring behavior of people in Thailand

**kidpen.space triggers ALL of these** by:
- Targeting Thai secondary students
- Collecting learning data, progress, interactions
- Offering free educational services
- Tracking learning behavior for personalization

### Key Definitions (Section 6)

| Term | PDPA Definition | kidpen.space Context |
|------|-----------------|---------------------|
| **Personal Data** | Data relating to identifiable person | Name, email, Google ID, learning history |
| **Sensitive Data** | Race, religion, health, etc. | NOT collected (avoid this category) |
| **Data Controller** | Determines purpose/means | kidpen.space organization |
| **Data Processor** | Processes on behalf of controller | Google (Drive), Cloud providers |
| **Minor** | Person under 20 years old | ALL target users (12-18) |

---

## 2. Consent Requirements for Minors

### PDPA Section 20: Minor Consent Rules

```
PDPA Age Thresholds:
├── Under 10 years: Parent/guardian consent REQUIRED
├── 10-19 years: Minor + Parent consent (dual consent)
│   └── Exception: "Sufficient understanding" for certain activities
└── 20+ years: Full adult consent capacity
```

### Practical Application for kidpen.space

**All users are 12-18 (minors aged 10-19)**:
- Technically requires parental consent
- BUT "sufficient understanding" exception may apply for educational services
- **Recommendation**: Implement dual consent to be safe

### Dual Consent Flow Design

```
REGISTRATION FLOW:
┌─────────────────────────────────────────────────────────┐
│ Step 1: Student Registration                            │
│ ├── Google OAuth (student's account)                   │
│ ├── Age verification (birthdate)                       │
│ ├── School level selection (ม.1-ม.6)                   │
│ └── Student consent acknowledgment                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Parent/Guardian Consent                         │
│ ├── Parent email/phone collection                      │
│ ├── Consent form sent to parent                        │
│ ├── Parent reviews data practices                      │
│ ├── Parent provides explicit consent                   │
│ └── Verification (email link / OTP)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Limited Access (pending parent consent)         │
│ ├── Basic features available                           │
│ ├── No AI tutoring (data processing)                   │
│ ├── Reminder to complete parent consent                │
│ └── 7-day grace period                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Full Access (after parent consent)              │
│ ├── AI tutoring enabled                                │
│ ├── Learning data collection active                    │
│ ├── Google Drive sync enabled                          │
│ └── Full personalization                               │
└─────────────────────────────────────────────────────────┘
```

### Consent Form Requirements

**Must include (Section 19)**:
1. Identity of data controller
2. Purpose of data collection
3. Types of data collected
4. Retention period
5. Data subject rights
6. Third-party sharing
7. Cross-border transfers
8. Contact information

**Sample Parent Consent Elements**:

```markdown
## ข้อตกลงการใช้งาน kidpen.space สำหรับผู้ปกครอง
### (Parent/Guardian Consent for kidpen.space)

**ข้อมูลที่เก็บรวบรวม (Data Collected)**:
- ชื่อ-นามสกุล (Name)
- อีเมล (Email via Google)
- ระดับชั้น (Grade level)
- ประวัติการเรียน (Learning history)
- คำถาม-คำตอบกับ AI (AI interactions)
- ความก้าวหน้าในการเรียน (Progress data)

**วัตถุประสงค์ (Purpose)**:
- การสอนพิเศษ STEM แบบส่วนตัว (Personalized STEM tutoring)
- การติดตามความก้าวหน้า (Progress tracking)
- การปรับปรุงระบบ (System improvement)

**การจัดเก็บข้อมูล (Data Storage)**:
- ข้อมูลจัดเก็บใน Google Drive ของนักเรียน
- นักเรียนเป็นเจ้าของข้อมูลของตนเอง
- สามารถลบข้อมูลได้ตลอดเวลา

☐ ข้าพเจ้ายินยอมให้บุตร/หลานของข้าพเจ้าใช้งาน kidpen.space
   (I consent to my child using kidpen.space)

☐ ข้าพเจ้าเข้าใจสิทธิในการเข้าถึง แก้ไข และลบข้อมูล
   (I understand the rights to access, correct, and delete data)
```

---

## 3. Data Minimization Principles

### Section 22: Purpose Limitation

**Collect only what's necessary**:

| Data Type | Necessary? | Purpose | Justification |
|-----------|------------|---------|---------------|
| Google ID | ✅ Yes | Authentication | Required for login |
| Email | ✅ Yes | Account recovery | Essential function |
| Name | ⚠️ Optional | Personalization | Can use nickname |
| Birthdate | ⚠️ Partial | Age verification | Year sufficient |
| School name | ❌ No | Analytics | Not needed |
| Phone number | ❌ No | - | Unnecessary |
| Location | ❌ No | - | Unnecessary |
| Photo | ❌ No | - | Unnecessary |

### kidpen.space Data Schema (PDPA-Compliant)

```sql
-- Minimal required data
CREATE TABLE users (
    id UUID PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,  -- Authentication
    display_name VARCHAR(100),       -- Can be nickname
    grade_level SMALLINT,            -- 1-6 for ม.1-ม.6
    birth_year SMALLINT,             -- Age verification only
    consent_status JSONB,            -- Consent tracking
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Parent consent tracking
CREATE TABLE parental_consents (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    parent_email VARCHAR(255),
    consent_given BOOLEAN,
    consent_date TIMESTAMP,
    consent_method VARCHAR(50),      -- email, otp, etc.
    ip_address VARCHAR(45),          -- For audit
    withdrawn_date TIMESTAMP         -- If consent withdrawn
);

-- Learning data (stored in user's Google Drive)
-- NOT in central database
-- See GDRIVE_INTEGRATION.md for structure
```

### Data NOT Stored Centrally

Following PDPA data minimization + architecture goals:

| Data Type | Storage Location | Reason |
|-----------|------------------|--------|
| AI conversations | User's Google Drive | Privacy, ownership |
| Learning progress | User's Google Drive | User control |
| Mastery scores | User's Google Drive | Personal data |
| Practice history | User's Google Drive | Sensitive learning data |
| Model cache | User's device | Performance |

---

## 4. Data Subject Rights

### PDPA Rights (Sections 30-36)

| Right | PDPA Section | Implementation |
|-------|--------------|----------------|
| Right to be informed | 23 | Privacy policy, consent forms |
| Right of access | 30 | Export data feature |
| Right to data portability | 31 | JSON/CSV export |
| Right to rectification | 35 | Edit profile feature |
| Right to erasure | 33 | Delete account feature |
| Right to restrict processing | 34 | Pause account feature |
| Right to object | 32 | Opt-out of features |
| Right to withdraw consent | 19 | Consent management |

### Implementation Requirements

**Data Export (Portability)**:
```javascript
// User data export format
{
  "exportDate": "2026-03-30T12:00:00Z",
  "userData": {
    "profile": { /* user profile */ },
    "learningHistory": { /* from Google Drive */ },
    "masteryScores": { /* from Google Drive */ },
    "aiConversations": { /* from Google Drive */ }
  },
  "format": "JSON",
  "encoding": "UTF-8"
}
```

**Account Deletion (Erasure)**:
```
Deletion Flow:
1. User requests deletion (in-app)
2. Verify identity (re-authentication)
3. Show data to be deleted
4. Confirmation with waiting period (72 hours)
5. Delete from Supabase (central)
6. Provide instructions for Google Drive cleanup
7. Send confirmation email
8. Log deletion for audit (anonymized)
```

**Google Drive Data Ownership**:
- Student owns their Google Drive data
- kidpen.space uses `drive.appdata` scope (app-specific folder)
- User can delete via Google Drive settings anytime
- Clear instructions provided for data cleanup

---

## 5. Cross-Border Data Transfer

### Section 28-29: Transfer Restrictions

**PDPA requires**:
- Adequate protection in destination country
- Data subject consent for transfer
- Contractual safeguards (SCCs)
- Binding corporate rules (if applicable)

### kidpen.space Data Flows

```
DATA FLOW ANALYSIS:

Student Device (Thailand)
    ↓ [Local processing]
    ↓
Google Drive (Google Cloud)
    ├── Servers: Singapore (primary), Taiwan (backup)
    ├── PDPA adequate?: Yes (APEC CBPR member)
    └── User consent: Via Google ToS + kidpen consent
    ↓
Supabase (PostgreSQL)
    ├── Region: Singapore (ap-southeast-1)
    ├── PDPA adequate?: Yes (Singapore PDPA)
    └── User consent: Via kidpen consent
    ↓
CDN (Model distribution)
    ├── Region: Singapore/Thailand edge
    └── No personal data transferred
```

### Adequacy Assessment

| Destination | PDPA Adequate? | Basis |
|-------------|----------------|-------|
| Singapore | ✅ Yes | APEC CBPR, Singapore PDPA |
| Taiwan | ✅ Yes | APEC CBPR member |
| USA (Google HQ) | ⚠️ Conditional | SCCs required |
| EU (if needed) | ✅ Yes | GDPR adequacy |

### Required Documentation

1. **Data Processing Agreement (DPA)** with Supabase
2. **Standard Contractual Clauses** for Google
3. **Data Transfer Impact Assessment**
4. **Records of Processing Activities**

---

## 6. Data Breach Procedures

### Section 37: Breach Notification

**Requirements**:
- Notify PDPC within 72 hours if risk to rights/freedoms
- Notify affected data subjects without delay if high risk
- Document all breaches (even if not reported)

### Breach Response Plan

```
INCIDENT RESPONSE PROCEDURE:

Hour 0-4: Detection & Assessment
├── Identify breach scope
├── Contain the breach
├── Assess risk level
└── Document findings

Hour 4-24: Classification
├── Low risk: Internal documentation only
├── Medium risk: PDPC notification preparation
└── High risk: Immediate PDPC + user notification

Hour 24-72: Notification (if required)
├── PDPC notification form submission
├── User notification (email, in-app)
├── Public statement (if widespread)
└── Remediation steps communicated

Post-Breach: Remediation
├── Root cause analysis
├── Security improvements
├── Policy updates
└── Training if needed
```

### Risk Assessment Matrix

| Factor | Low Risk | Medium Risk | High Risk |
|--------|----------|-------------|-----------|
| Data type | Display names | Email, grade | AI conversations |
| Volume | <100 users | 100-10,000 | >10,000 |
| Exposure | Internal only | Limited public | Widespread |
| Minor data | No | Partially | Yes |

---

## 7. Privacy Policy Requirements

### Required Elements (Thai Language)

```markdown
# นโยบายความเป็นส่วนตัว kidpen.space
## (Privacy Policy)

### 1. ผู้ควบคุมข้อมูล (Data Controller)
kidpen.space
อีเมล: privacy@kidpen.space

### 2. ข้อมูลที่เก็บรวบรวม (Data Collected)
- ข้อมูลบัญชี: ชื่อ อีเมล ระดับชั้น
- ข้อมูลการเรียน: ประวัติการเรียน คะแนน ความก้าวหน้า
- ข้อมูลการใช้งาน: การโต้ตอบกับ AI เวลาใช้งาน

### 3. วัตถุประสงค์ (Purpose)
- ให้บริการสอนพิเศษ STEM
- ปรับปรุงการเรียนรู้ส่วนบุคคล
- พัฒนาระบบการศึกษา

### 4. ฐานทางกฎหมาย (Legal Basis)
- ความยินยอม (Consent) - หลัก
- สัญญา (Contract) - การให้บริการ
- ประโยชน์อันชอบธรรม (Legitimate Interest) - การปรับปรุงระบบ

### 5. ระยะเวลาจัดเก็บ (Retention Period)
- ข้อมูลบัญชี: จนกว่าจะลบบัญชี
- ข้อมูลการเรียน: 2 ปีหลังใช้งานครั้งสุดท้าย
- ข้อมูลวิเคราะห์: 1 ปี (ไม่ระบุตัวตน)

### 6. การแบ่งปันข้อมูล (Data Sharing)
- Google: จัดเก็บใน Google Drive
- Supabase: ระบบฐานข้อมูล
- ไม่มีการขายข้อมูล

### 7. สิทธิของเจ้าของข้อมูล (Data Subject Rights)
- เข้าถึงข้อมูล
- แก้ไขข้อมูล
- ลบข้อมูล
- ถอนความยินยอม
- คัดค้านการประมวลผล

### 8. การติดต่อ (Contact)
privacy@kidpen.space

### 9. การเปลี่ยนแปลง (Updates)
แจ้งผ่านอีเมลและในแอป
```

---

## 8. Implementation Checklist

### Phase 1 (MVP Launch)

- [ ] Privacy policy (Thai + English)
- [ ] Terms of service (Thai + English)
- [ ] Dual consent flow (student + parent)
- [ ] Age verification gate
- [ ] Basic data export feature
- [ ] Account deletion feature
- [ ] Cookie consent banner
- [ ] Consent logging system

### Phase 2 (Enhancement)

- [ ] Consent management dashboard
- [ ] Parent dashboard (view child's data)
- [ ] Automated consent reminders
- [ ] Data retention automation
- [ ] Breach notification templates
- [ ] PDPC registration (if required)

### Phase 3 (Compliance Maturity)

- [ ] Annual privacy audit
- [ ] Data Protection Officer (if scale requires)
- [ ] Records of Processing Activities
- [ ] Data Protection Impact Assessment
- [ ] Third-party vendor assessments
- [ ] Staff privacy training

---

## 9. Risk Mitigation

### High-Risk Scenarios

| Scenario | Risk | Mitigation |
|----------|------|------------|
| Parent doesn't consent | User can't use AI | Limited mode available |
| Minor lies about age | Invalid consent | IP logging, school verification |
| Data breach | PDPC fine, reputation | Security measures, breach plan |
| Cross-border issues | Transfer violation | Singapore/APEC servers |
| Consent withdrawal | Data cleanup needed | Automated deletion pipeline |

### Penalty Structure (Section 90-91)

| Violation | Administrative Fine | Criminal Penalty |
|-----------|---------------------|------------------|
| Unlawful processing | Up to ฿5M | Up to 1 year prison |
| Sensitive data violation | Up to ฿5M | Up to 1 year prison |
| Cross-border violation | Up to ฿5M | - |
| Failure to notify breach | Up to ฿5M | - |
| Minor data without consent | Up to ฿5M | Up to 1 year prison |

**Note**: As kidpen.space handles minor data, penalties for violations could be severe. Compliance is critical.

---

## 10. Recommendations

### Architecture Alignment

The **Google Drive storage approach** is PDPA-advantageous:

1. **Data ownership**: Student owns data in their Drive
2. **Data minimization**: Central database holds minimal data
3. **Portability**: Native Google export features
4. **Deletion**: User controls via Google settings
5. **Cross-border**: Google's APEC compliance inherited

### Legal Review Requirement

Before launch:
1. Legal review of privacy policy
2. Legal review of consent flows
3. PDPC registration assessment
4. Data Processing Agreement with vendors

### Ongoing Compliance

- Quarterly consent audits
- Annual privacy policy review
- Continuous monitoring for PDPA updates
- User rights request tracking

---

## Sources

- Personal Data Protection Act B.E. 2562 (PDPA) - Full text
- PDPC (Personal Data Protection Committee) Guidelines
- Thailand Ministry of Digital Economy and Society
- APEC Cross-Border Privacy Rules
- Google Data Processing Terms
- Supabase Data Processing Agreement
- Thai Ministry of Education data handling guidelines
