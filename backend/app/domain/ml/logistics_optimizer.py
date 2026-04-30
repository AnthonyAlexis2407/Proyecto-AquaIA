"""
AquaIA — Logistics Optimizer (OR-Tools)
Optimiza las rutas de mantenimiento y distribución (RF-03).
"""
import numpy as np

try:
    from ortools.constraint_solver import routing_enums_pb2
    from ortools.constraint_solver import pywrapcp
    OR_TOOLS_AVAILABLE = True
except ImportError:
    OR_TOOLS_AVAILABLE = False

class LogisticsOptimizer:
    def __init__(self):
        self.base_location = [-12.0735, -75.2280] # Centro de Palián

    def solve_vrp(self, locations: list):
        """
        locations: lista de dicts con {id, lat, lon}
        """
        if not OR_TOOLS_AVAILABLE:
            route = [self.base_location] + [[loc['lat'], loc['lon']] for loc in locations] + [self.base_location]
            return {
                "route_points": route,
                "distance_km": round(len(locations) * 12.5, 2),
                "estimated_time_mins": len(locations) * 45,
                "status": "SIMULATED_MOCK"
            }

        all_coords = [self.base_location] + [[loc['lat'], loc['lon']] for loc in locations]
        num_locations = len(all_coords)
        
        def compute_distance(p1, p2):
            # Distancia euclidiana simple escalada
            return int(np.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) * 100000)

        distance_matrix = [[compute_distance(all_coords[i], all_coords[j]) for j in range(num_locations)] for i in range(num_locations)]

        manager = pywrapcp.RoutingIndexManager(num_locations, 1, 0)
        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):
            return distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            index = routing.Start(0)
            route_coords = []
            total_distance = 0
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                route_coords.append(all_coords[node_index])
                prev_index = index
                index = solution.Value(routing.NextVar(index))
                total_distance += routing.GetArcCostForVehicle(prev_index, index, 0)
            route_coords.append(all_coords[manager.IndexToNode(index)])
            
            return {
                "route_points": route_coords,
                "distance_km": round(total_distance / 10000, 2),
                "estimated_time_mins": int(total_distance / 2000) + (len(locations) * 30),
                "status": "OPTIMIZED_OR_TOOLS"
            }
        return {"error": "No solution found"}
