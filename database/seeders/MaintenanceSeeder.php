<?php

namespace Database\Seeders;

use App\Models\Maintenance;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $categories = [
            //civil status
            ['category_name' => 'Civil Status', 'category_value' => 'Single'],
            ['category_name' => 'Civil Status', 'category_value' => 'Married'],
            ['category_name' => 'Civil Status', 'category_value' => 'Widowed'],
            ['category_name' => 'Civil Status', 'category_value' => 'Separeted'],
            ['category_name' => 'Civil Status', 'category_value' => 'Common Law Spouse'],

            //sexes
            ['category_name' => 'Sex Category', 'category_value' => 'Male'],
            ['category_name' => 'Sex Category', 'category_value' => 'Female'],

            //sectoral categories
            ['category_name' => 'Sectoral Categories', 'category_value' => 'Solo Parent'],
            ['category_name' => 'Sectoral Categories', 'category_value' => 'PWD'],
            ['category_name' => 'Sectoral Categories', 'category_value' => 'IP (Indigenous People'],
            ['category_name' => 'Sectoral Categories', 'category_value' => 'IDP (Internally Displaced Person)'],
            ['category_name' => 'Sectoral Categories', 'category_value' => 'LGBTQ'],
            ['category_name' => 'Sectoral Categories', 'category_value' => 'Migratory Status'],
            ['category_name' => 'Sectoral Categories', 'category_value' => 'Ethnicity'],

            //type of violence
            ['category_name' => 'Violence Category', 'category_value' => 'VAWC - Violence Against Women and their Children '],
            ['category_name' => 'Violence Category', 'category_value' => 'Rape '],
            ['category_name' => 'Violence Category', 'category_value' => 'TIP - Trafficking in Person (Human Trafficking)'],
            ['category_name' => 'Violence Category', 'category_value' => 'Gender-based Street and Public Spaces Sexual Harrassment'],
            ['category_name' => 'Violence Category', 'category_value' => 'Sexual Harrasment'],
            ['category_name' => 'Violence Category', 'category_value' => 'Photo and Video Voyeurism'],
            ['category_name' => 'Violence Category', 'category_value' => 'Concubinage'],
            ['category_name' => 'Violence Category', 'category_value' => 'Child Pornography'],
            ['category_name' => 'Violence Category', 'category_value' => 'Child Abuse, Exploitation, and Discrimination'],

            //mode of entry
            ['category_name' => 'Mode of Entry', 'category_value' => 'Rescued through a Law Enforcement Operations'],
            ['category_name' => 'Mode of Entry', 'category_value' => 'Referral by a Referring Agency'],
            ['category_name' => 'Mode of Entry', 'category_value' => 'Walk-in'],
            ['category_name' => 'Mode of Entry', 'category_value' => 'Hepline'],
            ['category_name' => 'Mode of Entry', 'category_value' => 'Reported by a Companion/Relative or Informant'],

            //assistance
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'a. Livelihood Assistance'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'b. Financial Assistance for Employment'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'c. Skills Training'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'd. Medical Assistance'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'e. Educational Assistance'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'f. Support for Victims/ Witnesses'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'g. Psychosocial Counseling'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'h. Temporary Shelter'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'i. Employment Assistance'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'j. Hygiene Kit'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'k. food'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'l. Transportation/Balik Probinsiya'],
            ['category_name' => 'Services Assistance Provided to the Client', 'category_value' => 'm. Referral'],

            //Migratory Status
            ['category_name' => 'Migratory Status', 'category_value' => 'Current OFW'],
            ['category_name' => 'Migratory Status', 'category_value' => 'Former/Returning OFW'],
            ['category_name' => 'Migratory Status', 'category_value' => 'Seeking employment abroad'],
            ['category_name' => 'Migratory Status', 'category_value' => 'Not applicable'],

            //Religion
            ['category_name' => 'Religion', 'category_value' => 'Roman'],
            ['category_name' => 'Religion', 'category_value' => 'Catholic'],
            ['category_name' => 'Religion', 'category_value' => 'Islam Evangelicals'],
            ['category_name' => 'Religion', 'category_value' => 'Protestant'],
            ['category_name' => 'Religion', 'category_value' => 'Iglesia ni Christo'],

            // Intimate partner violence against women and their children
            ['category_name' => 'Intimate partner violence against women and their children', 'category_value' => 'Physical'],
            ['category_name' => 'Intimate partner violence against women and their children', 'category_value' => 'Sexual'],
            ['category_name' => 'Intimate partner violence against women and their children', 'category_value' => 'Psychological'],
            ['category_name' => 'Intimate partner violence against women and their children', 'category_value' => 'Economic'],

            //Rape Category
            ['category_name' => 'Rape Category', 'category_value' => 'Rape by sexual intercourse'],
            ['category_name' => 'Rape Category', 'category_value' => 'Rape by sexual assault'],
            ['category_name' => 'Rape Category', 'category_value' => 'Incest'],
            ['category_name' => 'Rape Category', 'category_value' => 'Statutory rape'],
            ['category_name' => 'Rape Category', 'category_value' => 'Marital rape'],

            //PWD Category
            ['category_name' => 'PWD Category', 'category_value' => 'Deaf or Hard of Hearing'],
            ['category_name' => 'PWD Category', 'category_value' => 'Intellectual Disability'],
            ['category_name' => 'PWD Category', 'category_value' => 'Learning Disability'],
            ['category_name' => 'PWD Category', 'category_value' => 'Mental Disability'],
            ['category_name' => 'PWD Category', 'category_value' => 'Orthopedic Disability'],
            ['category_name' => 'PWD Category', 'category_value' => 'Physical Disability'],
            ['category_name' => 'PWD Category', 'category_value' => 'Psychosocial Disability'],
            ['category_name' => 'PWD Category', 'category_value' => 'Speech and Language Disability'],
            ['category_name' => 'PWD Category', 'category_value' => 'Visual Disability'],

            //Trafficking in persons
            ['category_name' => 'Trafficking in persons', 'category_value' => 'Sexual exploitation'],
            ['category_name' => 'Trafficking in persons', 'category_value' => 'Online sexual exploitation'],
            ['category_name' => 'Trafficking in persons', 'category_value' => 'Forced labor'],
            ['category_name' => 'Trafficking in persons', 'category_value' => 'Sale or removal of organs'],
            ['category_name' => 'Trafficking in persons', 'category_value' => 'Prostitution'],

            //Sexual harassment
            ['category_name' => 'Sexual harassment', 'category_value' => 'Verbal'],
            ['category_name' => 'Sexual harassment', 'category_value' => 'Physical'],
            ['category_name' => 'Sexual harassment', 'category_value' => 'Use of objects, pictures, letters, or notes with sexual underpinnings'],

            //Child abuse, exploitation, and discrimination
            ['category_name' => 'Child abuse, exploitation, and discrimination', 'category_value' => 'Engage, facilitate, promote or attempt to commit child prostitution'],
            ['category_name' => 'Child abuse, exploitation, and discrimination', 'category_value' => 'Sexual Intercourse or lascivious conduct'],

            //Gender-based Streets and Public Spaces Sexual Harassment
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Catcalling/Wolf-whistling'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Misogynistic, transphobic, homophobic, sexist slurs'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Public Masturbation/Flashing of private parts'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Groping'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Offensive Body Gestures'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Instrusive gazing/Leering'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Stalking/Cyberstalking'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Uploading and sharing of photos/videos/information'],
            ['category_name' => 'Gender-based Streets and Public Spaces Sexual Harassment', 'category_value' => 'Impersonating identities'],

            //Type of Place of Incident
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'Conjugal Home'],
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'Victim’s Home'],
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'Perpetrator’s Home'],
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'Malls/Hotels'],
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'School'],
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'Workplace'],
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'Public Utility Vehicle (PUV)'],
            ['category_name' => 'Type of Place of Incident', 'category_value' => 'Evacuation area'],

            //Incident Conflict Area
            ['category_name' => 'Incident Conflict Area', 'category_value' => 'Insurgency'],
            ['category_name' => 'Incident Conflict Area', 'category_value' => 'Violent extremism'],
            ['category_name' => 'Incident Conflict Area', 'category_value' => 'Tribal violence'],
            ['category_name' => 'Incident Conflict Area', 'category_value' => 'Political violence'],
            ['category_name' => 'Incident Conflict Area', 'category_value' => 'Rido'],

            //Referral Service
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Barangay', 'category_des' => 'Issuance/enforcement of Barangay Protection Order (BPO)'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Barangay', 'category_des' => 'Others, specify:'],

            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Social Welfare and Development Office', 'category_des' => 'Psychosocial'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Social Welfare and Development Office', 'category_des' => 'Emergency/ Temporary shelter'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Social Welfare and Development Office', 'category_des' => 'Economic assistance'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Social Welfare and Development Office', 'category_des' => 'Residential facility'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Social Welfare and Development Office', 'category_des' => 'Others, specify:'],

            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Law Enforcement', 'category_des' => 'Receipt and recording of complaints'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Law Enforcement', 'category_des' => 'Rescue operations for VAWC cases'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Law Enforcement', 'category_des' => 'Forensic interview and investigations'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Law Enforcement', 'category_des' => 'Medico-legal exam'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Law Enforcement', 'category_des' => 'Others, specify:'],

            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Legal Assistance', 'category_des' => 'Legal counselling'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Legal Assistance', 'category_des' => 'Representation in court'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Legal Assistance', 'category_des' => 'Documentation and notarization'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Legal Assistance', 'category_des' => 'Assist in filing of petition for TPO/PPO'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Legal Assistance', 'category_des' => 'Mediation'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Legal Assistance', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Referral Service', 'category_value' => 'Referred to Other Service Provider', 'category_des' => 'Others, specify:'],

            ['category_name' => 'Organization', 'category_value' => 'RICTMS', 'category_des' => 'Others, specify:'],

            ['category_name' => 'Job Title', 'category_value' => 'Computer Programmer III', 'category_des' => 'Others, specify:'],


            // Barangay Protection Order
            // ENGLISH
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'I,', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'give my permission to DSWD to share information about me and the incident that I reported to them to other', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'service providers that they deem appropriate so that I can receive help on safety, health and psychosocial, legal, and other needs.', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'I also understand that shared information will be treated with confidentiality and respect, and shared only as needed to provide the assistance that I need.', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'I understand that releasing this information means that a person from the agency where my case was reported, may talk or discuss with me.', 'category_des' => 'Others, specify:'],
            // TAGALOG
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'Ako si,', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => ', binigbigyan ng pahintulot ang DSWD na magbahagi ng impormasyon tungkol sa akin at sa mga', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'pangyayari na inulat ko sa kanila sa iba pang mga service providers na makatutulong sa aking kaligtasan, kalusugan at psychosocial, legal at iba pang mga pangangailangan.', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'Nauunawaan ko na ang ibinahagi kong impormasyon ay mananatiling pribado at ibabahagi lamang kung kinakailangan at makatutulong sa akin.', 'category_des' => 'Others, specify:'],
            ['category_name' => 'Barangay Protection Order', 'category_value' => 'Nauunawan ko na ang pagbahagi ng aking impormasyon ay nangangahulugan na ang organinasyon kung saan ang aking kaso ay maaring makipagusap sa akin.', 'category_des' => 'Others, specify:'],

            ['category_name' => 'Educational Attainment', 'category_value' => 'No formal education'],
            ['category_name' => 'Educational Attainment', 'category_value' => 'Elementary level/graduate'],
            ['category_name' => 'Educational Attainment', 'category_value' => 'Junior high school level/graduate'],
            ['category_name' => 'Educational Attainment', 'category_value' => 'Senior high school level/graduate'],
            ['category_name' => 'Educational Attainment', 'category_value' => 'Technical/vocational'],
            ['category_name' => 'Educational Attainment', 'category_value' => 'College level/graduate'],
            ['category_name' => 'Educational Attainment', 'category_value' => 'Post graduate'],
        ];

        /*

         ['category_name' => '', 'category_value' => ''] ,
         ['category_name' => '', 'category_value' => ''] ,
         ['category_name' => '', 'category_value' => ''] ,

        */
        foreach ($categories as $category) {
            Maintenance::create([
                ...$category,
                'created_by' => '1',
                'updated_by' => '1',
            ]);
        }
    }
}
