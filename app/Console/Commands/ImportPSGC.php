<?php

namespace App\Console\Commands;

use App\Http\Controllers\PsgcController;
use Illuminate\Console\Command;

class ImportPSGC extends Command
{
    protected $signature = 'import:psgc';
    protected $description = 'Import PSGC data';

    public function handle()
    {
        $controller = new PsgcController;
        $controller->importPsgc(); // Call your import function

        $this->info('PSGC import completed successfully.');
    }
}
