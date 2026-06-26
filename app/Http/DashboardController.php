<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Assignment;
use App\Models\FuelRecord;
use App\Models\Vehicle;
use App\Models\WorkOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // GET /api/dashboard
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // ── Statistiques globales ─────────────────────────────
        $vehicles       = Vehicle::all();
        $workOrders     = WorkOrder::with('parts')->get();
        $fuelRecords    = FuelRecord::all();
        $assignments    = Assignment::all();
        $activeAlerts   = Alert::where('treated', false)->get();

        $disponibles    = $vehicles->where('status', 'disponible')->count();
        $enMission      = $vehicles->where('status', 'en_mission')->count();
        $enMaintenance  = $vehicles->where('status', 'en_maintenance')->count();

        $maintenanceCost = $workOrders->sum(fn($wo) =>
            $wo->parts->sum(fn($p) => $p->qty * $p->unit_price)
            + ($wo->hours_worked * $wo->labor_cost_per_hour)
        );

        $kpis = [
            'vehicles_total'      => $vehicles->count(),
            'vehicles_disponible' => $disponibles,
            'vehicles_en_mission' => $enMission,
            'vehicles_maintenance'=> $enMaintenance,
            'work_orders_open'    => $workOrders->whereIn('status', ['ouvert', 'en_cours'])->count(),
            'fuel_cost_total'     => $fuelRecords->sum('cost'),
            'maintenance_cost'    => $maintenanceCost,
            'active_alerts'       => $activeAlerts->count(),
            'critical_alerts'     => $activeAlerts->where('level', 'critical')->count(),
            'active_assignments'  => $assignments->where('status', 'active')->count(),
        ];

        // ── Données pour graphiques ────────────────────────────
        $charts = [
            'availability' => $this->monthlyAvailability(),
            'fuel_monthly' => $this->monthlyFuel(),
        ];

        return response()->json([
            'kpis'   => $kpis,
            'charts' => $charts,
            'recent_alerts' => Alert::with('vehicle:id,plate')
                ->where('treated', false)
                ->whereIn('level', ['critical', 'danger'])
                ->orderByRaw("CASE level WHEN 'critical' THEN 1 ELSE 2 END")
                ->limit(5)
                ->get(),
        ]);
    }

    private function monthlyAvailability(): array
    {
        // Placeholder — à calculer avec les vraies données historiques
        return [80, 85, 78, 90, 88, 75, 82, 91, 87, 84, 79, 88];
    }

    private function monthlyFuel(): array
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $data[] = [
                'month'  => $month->format('M'),
                'liters' => FuelRecord::whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('liters'),
                'cost'   => FuelRecord::whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('cost'),
            ];
        }
        return $data;
    }
}
