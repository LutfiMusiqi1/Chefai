# Supabase Database Integration - Reflection

## Çfarë është RLS (Row Level Security) dhe pse është e rëndësishme?

Row Level Security (RLS) është një mekanizëm sigurie në bazat e të dhënave që kontrollon aksesin në rreshtat individuale të një tabele bazuar në kushte specifike. Në Supabase, RLS lejon që çdo rresht të ketë politika të veta për SELECT, INSERT, UPDATE dhe DELETE.

RLS është e rëndësishme sepse:
- **Siguria e të dhënave**: Parandalon që përdoruesit të shohin ose modifikojnë të dhënat e përdoruesve të tjerë
- **Privatësia**: Çdo përdorues sheh vetëm të dhënat e veta
- **Parandalimi i aksesit të paautorizuar**: Edhe nëse dikush gjen një API key, nuk mund të shohë të dhënat e të tjerëve
- **Zbatimi automatik**: Politikat zbatohen në nivel databaze, jo vetëm në aplikacion

## Si e lidhe tabelën me auth (user_id)?

Tabela lidhet me sistemin e autentifikimit përmes kolonës `user_id`:
1. Kolona `user_id` është UUID dhe referon `auth.users(id)` si foreign key
2. Kur krijohet një rekord i ri, vendoset `user_id = auth.uid()` (ID e përdoruesit të loguar)
3. Politikat RLS përdorin `auth.uid()` për të kontrolluar aksesin
4. Kështu çdo rekord është i lidhur me pronarin e tij

## Çfarë ndodh nëse nuk aktivizon RLS?

Pa RLS të aktivizuar:
- **Rrezik sigurie**: Të gjithë përdoruesit mund të shohin të gjitha të dhënat
- **Humbje privatësie**: Nuk ka ndarje midis të dhënave të përdoruesve
- **Akses i paautorizuar**: Çdo përdorues mund të lexojë, shtojë, ndryshojë ose fshijë të dhënat e të tjerëve
- **Shkelje të GDPR**: Mund të çojë në probleme ligjore për trajtimin e të dhënave personale
- **Nuk ka kontroll**: Aplikacioni duhet të filtrojë të dhënat manualisht, por API keys publike mund të përdoren për akses të plotë

## Testimi me 2 user

Për testimin me 2 përdorues:

1. **Krijo 2 llogari** në aplikacion (signup me email të ndryshëm)
2. **Verifiko user IDs** në Supabase Dashboard > Authentication > Users
3. **Shto receta** për secilin përdorues:
   - User 1 shton "Pasta Carbonara"
   - User 2 shton "Chicken Stir Fry"
4. **Logo me secilin përdorues** dhe verifiko që:
   - User 1 sheh vetëm "Pasta Carbonara"
   - User 2 sheh vetëm "Chicken Stir Fry"
   - Asnjëri nuk sheh recetat e tjetrit
5. **Screenshot** i dashboard-it për secilin përdorues që tregon vetëm recetat e veta

Ky testim provon që RLS funksionon si duhet dhe të dhënat janë të izoluara për secilin përdorues.