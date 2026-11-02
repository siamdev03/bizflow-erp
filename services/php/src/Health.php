<?php
namespace BizFlow;

/** Optional PHP integration health contract. Not needed for the Node MVP. */
final class Health
{
    public static function response(): array
    {
        return [
            'service' => 'bizflow-php-adapter',
            'status' => 'scaffolded',
            'database' => 'MongoDB (shared URI when configured)',
        ];
    }
}
