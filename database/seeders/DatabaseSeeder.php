<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Assignment;
use App\Models\BTPart;
use App\Models\Chantier;
use App\Models\Driver;
use App\Models\FuelRecord;
use App\Models\Mechanic;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\WorkOrder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Utilisateurs ─────────────────────────────────────────
        $admin = User::updateOrCreate(['email' => 'admin@vicas.sn'], [
            'first_name' => 'Admin', 'last_name' => 'VICAS',
            'phone' => '+221 77 000 00 01', 'role' => 'administrateur',
            'password' => Hash::make('demo1234'), 'active' => true,
        ]);
        $log = User::updateOrCreate(['email' => 'logistique@vicas.sn'], [
            'first_name' => 'Moussa', 'last_name' => 'Diallo',
            'phone' => '+221 77 000 00 02', 'role' => 'responsable_logistique',
            'password' => Hash::make('demo1234'), 'active' => true,
        ]);
        $chef = User::updateOrCreate(['email' => 'atelier@vicas.sn'], [
            'first_name' => 'Ibrahima', 'last_name' => 'Sow',
            'phone' => '+221 77 000 00 03', 'role' => 'chef_atelier',
            'password' => Hash::make('demo1234'), 'active' => true,
        ]);
        $meca = User::updateOrCreate(['email' => 'meca1@vicas.sn'], [
            'first_name' => 'Cheikh', 'last_name' => 'Ndiaye',
            'phone' => '+221 77 000 00 04', 'role' => 'mecanicien',
            'password' => Hash::make('demo1234'), 'active' => true,
        ]);
        $chauffeur = User::updateOrCreate(['email' => 'chauffeur1@vicas.sn'], [
            'first_name' => 'Oumar', 'last_name' => 'Ba',
            'phone' => '+221 77 000 00 05', 'role' => 'chauffeur',
            'password' => Hash::make('demo1234'), 'active' => true,
        ]);
        User::updateOrCreate(['email' => 'direction@vicas.sn'], [
            'first_name' => 'Directeur', 'last_name' => 'VICAS',
            'phone' => '+221 77 000 00 06', 'role' => 'direction',
            'password' => Hash::make('demo1234'), 'active' => true,
        ]);

        // ── Véhicules ─────────────────────────────────────────────
        $v1 = Vehicle::create(['plate'=>'DK-1234-AA','type'=>'camion','brand'=>'Mercedes','model'=>'Actros','year'=>2019,'km'=>45000,'hours'=>1200,'status'=>'disponible','fuel_type'=>'diesel','tank_capacity'=>400,'acquisition_date'=>'2019-03-15','insurance_expiry'=>'2025-03-15','technical_visit_expiry'=>'2025-06-20','next_maintenance_km'=>50000]);
        $v2 = Vehicle::create(['plate'=>'DK-5678-BB','type'=>'pelleteuse','brand'=>'Caterpillar','model'=>'320','year'=>2020,'km'=>0,'hours'=>3200,'status'=>'disponible','fuel_type'=>'diesel','tank_capacity'=>350,'acquisition_date'=>'2020-07-01','insurance_expiry'=>'2025-07-01','technical_visit_expiry'=>'2025-09-15','next_maintenance_km'=>0,'next_maintenance_km'=>0]);
        $v3 = Vehicle::create(['plate'=>'DK-9101-CC','type'=>'grue','brand'=>'Liebherr','model'=>'LTM 1050','year'=>2018,'km'=>0,'hours'=>5600,'status'=>'en_maintenance','fuel_type'=>'diesel','tank_capacity'=>500,'acquisition_date'=>'2018-01-20','insurance_expiry'=>'2025-01-20','technical_visit_expiry'=>'2024-12-10','next_maintenance_km'=>0]);
        $v4 = Vehicle::create(['plate'=>'DK-1121-DD','type'=>'compacteur','brand'=>'Dynapac','model'=>'CA250','year'=>2021,'km'=>0,'hours'=>890,'status'=>'disponible','fuel_type'=>'diesel','tank_capacity'=>200,'acquisition_date'=>'2021-05-10','insurance_expiry'=>'2025-05-10','technical_visit_expiry'=>'2025-08-22','next_maintenance_km'=>0]);
        $v5 = Vehicle::create(['plate'=>'DK-3141-EE','type'=>'bulldozer','brand'=>'Komatsu','model'=>'D65EX','year'=>2017,'km'=>0,'hours'=>7800,'status'=>'disponible','fuel_type'=>'diesel','tank_capacity'=>450,'acquisition_date'=>'2017-11-03','insurance_expiry'=>'2024-11-03','technical_visit_expiry'=>'2024-11-03','next_maintenance_km'=>0]);
        $v6 = Vehicle::create(['plate'=>'DK-5161-FF','type'=>'vehicule_leger','brand'=>'Toyota','model'=>'Hilux','year'=>2022,'km'=>28000,'hours'=>0,'status'=>'en_mission','fuel_type'=>'diesel','tank_capacity'=>80,'acquisition_date'=>'2022-09-01','insurance_expiry'=>'2025-09-01','technical_visit_expiry'=>'2025-11-30','next_maintenance_km'=>30000]);

        // ── Chantiers ─────────────────────────────────────────────
        $c1 = Chantier::create(['name'=>'Autoroute Thiès-Mbour','code'=>'CH-001','location'=>'Thiès, Sénégal','manager'=>'Amadou Diop','status'=>'actif','start_date'=>'2024-01-15']);
        $c2 = Chantier::create(['name'=>'Pont de Casamance','code'=>'CH-002','location'=>'Ziguinchor, Sénégal','manager'=>'Fatou Sall','status'=>'actif','start_date'=>'2024-03-01']);
        $c3 = Chantier::create(['name'=>'Immeuble Plateau','code'=>'CH-003','location'=>'Dakar, Sénégal','manager'=>'Moussa Faye','status'=>'suspendu','start_date'=>'2023-06-10']);
        $c4 = Chantier::create(['name'=>'Route Kaolack-Fatick','code'=>'CH-004','location'=>'Kaolack, Sénégal','manager'=>'Ibrahima Sy','status'=>'termine','start_date'=>'2023-01-01','end_date'=>'2024-01-01']);

        // ── Chauffeurs ────────────────────────────────────────────
        $d1 = Driver::create(['first_name'=>'Oumar','last_name'=>'Ba','phone'=>'+221 77 111 22 33','license_number'=>'SN-2019-4521','license_expiry'=>'2026-08-15','status'=>'en_mission','user_id'=>$chauffeur->id]);
        $d2 = Driver::create(['first_name'=>'Mamadou','last_name'=>'Diop','phone'=>'+221 77 222 33 44','license_number'=>'SN-2020-7832','license_expiry'=>'2025-12-01','status'=>'disponible']);
        $d3 = Driver::create(['first_name'=>'Abdou','last_name'=>'Fall','phone'=>'+221 77 333 44 55','license_number'=>'SN-2018-3214','license_expiry'=>'2024-05-20','status'=>'disponible']);

        // ── Mécaniciens ───────────────────────────────────────────
        $m1 = Mechanic::create(['first_name'=>'Cheikh','last_name'=>'Ndiaye','phone'=>'+221 77 444 55 66','speciality'=>'Moteur diesel','user_id'=>$meca->id]);
        $m2 = Mechanic::create(['first_name'=>'Serigne','last_name'=>'Mbaye','phone'=>'+221 77 555 66 77','speciality'=>'Hydraulique & électrique']);

        // ── Bons de travail ───────────────────────────────────────
        $bt1 = WorkOrder::create(['vehicle_id'=>$v3->id,'type'=>'corrective','description'=>'Remplacement pompe hydraulique principale','mechanic_id'=>$m1->id,'date'=>'2025-01-10','status'=>'en_cours','hours_worked'=>8,'labor_cost_per_hour'=>15000]);
        BTPart::create(['work_order_id'=>$bt1->id,'ref'=>'HYD-PMP-001','designation'=>'Pompe hydraulique Liebherr','qty'=>1,'unit_price'=>450000]);
        BTPart::create(['work_order_id'=>$bt1->id,'ref'=>'HYD-JNT-005','designation'=>'Joint d\'étanchéité kit','qty'=>2,'unit_price'=>25000]);

        $bt2 = WorkOrder::create(['vehicle_id'=>$v1->id,'type'=>'preventive','description'=>'Vidange moteur + filtres','mechanic_id'=>$m1->id,'date'=>'2025-01-05','status'=>'cloture','hours_worked'=>3,'labor_cost_per_hour'=>12000]);
        BTPart::create(['work_order_id'=>$bt2->id,'ref'=>'FLT-HUI-003','designation'=>'Filtre à huile','qty'=>1,'unit_price'=>8500]);
        BTPart::create(['work_order_id'=>$bt2->id,'ref'=>'HUI-MOT-15W','designation'=>'Huile moteur 15W40 (5L)','qty'=>4,'unit_price'=>12000]);

        $bt3 = WorkOrder::create(['vehicle_id'=>$v5->id,'type'=>'preventive','description'=>'Graissage châssis et révision générale','mechanic_id'=>$m2->id,'date'=>'2025-01-08','status'=>'termine','hours_worked'=>5,'labor_cost_per_hour'=>12000]);

        // ── Enregistrements carburant ─────────────────────────────
        FuelRecord::create(['vehicle_id'=>$v1->id,'driver_id'=>$d1->id,'date'=>'2025-01-12','fuel_type'=>'diesel','liters'=>250,'cost'=>275000,'odometer'=>44800,'supplier'=>'Total Sénégal']);
        FuelRecord::create(['vehicle_id'=>$v6->id,'driver_id'=>$d1->id,'date'=>'2025-01-10','fuel_type'=>'diesel','liters'=>60,'cost'=>72000,'odometer'=>27500,'supplier'=>'Shell Dakar']);
        FuelRecord::create(['vehicle_id'=>$v2->id,'driver_id'=>$d2->id,'date'=>'2025-01-08','fuel_type'=>'diesel','liters'=>180,'cost'=>198000,'odometer'=>0,'supplier'=>'Total Sénégal']);
        FuelRecord::create(['vehicle_id'=>$v4->id,'driver_id'=>$d3->id,'date'=>'2025-01-06','fuel_type'=>'diesel','liters'=>120,'cost'=>132000,'odometer'=>0,'supplier'=>'Petro Sénégal']);

        // ── Affectations ──────────────────────────────────────────
        Assignment::create(['vehicle_id'=>$v6->id,'driver_id'=>$d1->id,'chantier_id'=>$c1->id,'start_date'=>'2025-01-08','departure_km'=>27000,'status'=>'active','notes'=>'Liaison quotidienne Dakar-Thiès']);

        // ── Alertes ───────────────────────────────────────────────
        Alert::create(['vehicle_id'=>$v3->id,'type'=>'visite_technique','level'=>'critical','message'=>'Visite technique expirée depuis le 10/12/2024','due_date'=>'2024-12-10','treated'=>false]);
        Alert::create(['vehicle_id'=>$v5->id,'type'=>'assurance','level'=>'critical','message'=>'Assurance expirée depuis le 03/11/2024','due_date'=>'2024-11-03','treated'=>false]);
        Alert::create(['vehicle_id'=>$v1->id,'type'=>'revision','level'=>'warning','message'=>'Révision prévue à 50 000 km (actuel : 45 000 km)','due_date'=>'2025-03-01','treated'=>false]);
        Alert::create(['vehicle_id'=>$v6->id,'type'=>'vidange','level'=>'info','message'=>'Prochaine vidange dans 2 000 km','due_date'=>'2025-02-15','treated'=>false]);
        Alert::create(['vehicle_id'=>$v2->id,'type'=>'revision','level'=>'danger','message'=>'3 200 heures — révision majeure requise','due_date'=>'2025-01-20','treated'=>false]);

        $this->command->info('✅ Base de données alimentée avec les données de démonstration VICAS GMAO');
        $this->command->info('   6 utilisateurs | 6 véhicules | 4 chantiers | 3 chauffeurs | 2 mécaniciens');
        $this->command->info('   3 bons de travail | 4 pleins | 1 affectation | 5 alertes');
        $this->command->info('   Mot de passe : demo1234');
    }
}
