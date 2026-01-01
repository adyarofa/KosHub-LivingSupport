<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class LivingSupport extends ResourceController
{
    protected $format = 'json';

    private array $services = [
        ["id" => "laundry-weekly", "type" => "laundry", "name" => "Laundry Weekly", "price" => 50000],
        ["id" => "catering-weekly", "type" => "catering", "name" => "Catering Weekly", "price" => 250000],
        ["id" => "catering-monthly", "type" => "catering", "name" => "Catering Monthly", "price" => 900000],
    ];

    public function health()
    {
        return $this->respond([
            "status" => "ok",
            "service" => "living-support",
            "time" => gmdate("c")
        ]);
    }


    public function services()
    {
        $apiKey = $this->request->getHeaderLine('x-api-key');
        if ($apiKey !== "koshub123") {
            return $this->failUnauthorized("Invalid API key");
        }

        return $this->respond(["items" => $this->services]);
    }

    public function createOrder()
    {
        $apiKey = $this->request->getHeaderLine('x-api-key');
        if ($apiKey !== "koshub123") {
            return $this->failUnauthorized("Invalid API key");
        }

        $data = $this->request->getJSON(true);
        $serviceId = $data["service_id"] ?? null;
        if (!$serviceId) {
            return $this->failValidationErrors("service_id is required");
        }

        $exists = false;
        foreach ($this->services as $s) {
            if ($s["id"] === $serviceId) $exists = true;
        }
        if (!$exists) {
            return $this->failValidationErrors("Unknown service_id");
        }

        $orderId = bin2hex(random_bytes(8));

        return $this->respondCreated([
            "id" => $orderId,
            "service_id" => $serviceId,
            "status" => "created",
            "created_at" => gmdate("c")
        ]);
    }

    public function getOrder($id = null)
    {
        $apiKey = $this->request->getHeaderLine('x-api-key');
        if ($apiKey !== "koshub123") {
            return $this->failUnauthorized("Invalid API key");
        }

        return $this->respond([
            "id" => $id,
            "status" => "created"
        ]);
    }
}
